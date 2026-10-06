// syncQueue.js - Offline-First Mutation Queue and Automatic Sync Engine

import { offlineStorage, saveOfflineMedia, getOfflineMedia } from "./offlineStorage";
import toast from "react-hot-toast";
import { App as CapApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { getNetworkStatus, subscribeNetworkStatus } from "./networkManager";

const QUEUE_STORAGE_KEY = "minesight_offline_sync_queue";

// Helper to get raw queue items
export function getStoredQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Helper to persist queue items
export function setStoredQueue(queue) {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    notifyQueueChange(queue.length);
  } catch (e) {
    console.warn("Failed to persist sync queue:", e);
  }
}

// Custom Event Notification for reactive UI updates
function notifyQueueChange(pendingCount) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("minesight:queue-updated", {
        detail: { pendingCount },
      })
    );
  }
}

let isSyncing = false;
let syncListeners = [];
let retryTimer = null;

export function subscribeToSyncStatus(listener) {
  syncListeners.push(listener);
  return () => {
    syncListeners = syncListeners.filter((l) => l !== listener);
  };
}

function notifySyncStatus(status) {
  syncListeners.forEach((listener) => {
    try {
      listener(status);
    } catch (e) {
      console.error("Sync listener error:", e);
    }
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("minesight:sync-status", {
        detail: status,
      })
    );
  }
}

// Add an operation to the sync queue
export async function enqueueMutation({
  type,
  method,
  url,
  payload,
  isFormData = false,
  files = [], // Array of { fieldName, mediaKey, fileName, type }
  entityType,
  localId,
  label = "Item",
}) {
  const queue = getStoredQueue();

  // Strip raw dataUrl strings to prevent localStorage QuotaExceededError;
  // prepareRequestData retrieves full media data via mediaKey
  const sanitizedFiles = (files || []).map((f) => ({
    fieldName: f.fieldName,
    mediaKey: f.mediaKey,
    fileName: f.fileName,
    type: f.type,
  }));

  const queueItem = {
    id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    method: method.toUpperCase(),
    url,
    payload,
    isFormData,
    files: sanitizedFiles,
    entityType,
    localId,
    label,
    createdAt: new Date().toISOString(),
    retries: 0,
  };

  queue.push(queueItem);
  setStoredQueue(queue);

  return queueItem;
}

// Remove an item from the queue
export function dequeueMutation(id) {
  const queue = getStoredQueue();
  const nextQueue = queue.filter((item) => item.id !== id);
  setStoredQueue(nextQueue);
}

// Remove any mutations associated with a local ID or URL
export function removeQueuedMutationsByLocalId(localId) {
  if (!localId) return;
  const queue = getStoredQueue();
  const idStr = String(localId);
  const nextQueue = queue.filter(
    (item) => item.localId !== localId && !item.url?.includes(idStr)
  );
  setStoredQueue(nextQueue);
}

// Helper: convert Data URI to Blob directly without external network fetch
function dataURItoBlob(dataURI) {
  if (!dataURI) return null;
  if (dataURI instanceof Blob) return dataURI;
  try {
    const parts = dataURI.split(",");
    if (parts.length < 2) return null;
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";
    const binary = atob(parts[1]);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], { type: mimeType });
  } catch (err) {
    console.warn("dataURItoBlob fallback error:", err);
    return null;
  }
}

// Reconstitute payload and files if needed (e.g. for FormData multipart uploads)
async function prepareRequestData(item) {
  if (!item.isFormData) {
    return item.payload;
  }

  const formData = new FormData();

  // Append text payload fields
  if (item.payload) {
    Object.entries(item.payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value) || typeof value === "object") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });
  }

  // Restore stored media blobs (photos, audio)
  if (item.files && item.files.length) {
    for (const fileDef of item.files) {
      const mediaData = await getOfflineMedia(fileDef.mediaKey);
      if (mediaData) {
        let blob = null;
        if (typeof mediaData === "string" && mediaData.startsWith("data:")) {
          blob = dataURItoBlob(mediaData);
          if (!blob) {
            try {
              const res = await fetch(mediaData);
              blob = await res.blob();
            } catch (err) {
              console.warn("Fetch data URI error:", err);
            }
          }
        } else if (mediaData instanceof Blob) {
          blob = mediaData;
        }

        if (blob) {
          formData.append(
            fileDef.fieldName,
            blob,
            fileDef.fileName || `${fileDef.fieldName}-${Date.now()}.bin`
          );
        }
      }
    }
  }

  return formData;
}

// Process all pending queued mutations sequentially
export async function processSyncQueue(apiClient) {
  if (isSyncing) return { success: false, message: "Sync already in progress" };
  const isOnline = getNetworkStatus();
  if (!isOnline && typeof navigator !== "undefined" && !navigator.onLine) {
    return { success: false, message: "Device is offline" };
  }

  const queue = getStoredQueue();
  if (!queue.length) {
    notifySyncStatus({ isSyncing: false, pendingCount: 0, lastSynced: new Date() });
    return { success: true, processed: 0 };
  }

  isSyncing = true;
  notifySyncStatus({ isSyncing: true, pendingCount: queue.length });

  // Ensure we have a valid server token before attempting remote mutations
  let currentToken = localStorage.getItem("token") || "";
  const OFFLINE_PASSWORDS = {
    "admin@cil.gov.in": "admin123",
    "rajesh@ncl.gov.in": "mine123",
    "priya@ncl.gov.in": "mine123",
    "corporate@cil.gov.in": "corp123",
    "regulator@dgms.gov.in": "reg123",
    "worker@cil.gov.in": "worker123",
    "ananya@shakticontractors.in": "contract123",
  };

  if (currentToken.startsWith("offline_token_")) {
    const realToken = localStorage.getItem("real_server_token");
    if (realToken) {
      localStorage.setItem("token", realToken);
      currentToken = realToken;
    } else {
      try {
        let savedCreds = null;
        try {
          savedCreds = JSON.parse(localStorage.getItem("offline_login_credentials") || "null");
        } catch {}
        const user = JSON.parse(localStorage.getItem("user") || "null");
        const email = savedCreds?.email || user?.email?.toLowerCase();
        const password = savedCreds?.password || (email && OFFLINE_PASSWORDS[email]);
        if (email && password) {
          const loginRes = await apiClient.post("/auth/login", {
            email,
            password,
            isNativeApp: true,
          });
          if (loginRes.data?.token) {
            localStorage.setItem("token", loginRes.data.token);
            localStorage.setItem("real_server_token", loginRes.data.token);
            currentToken = loginRes.data.token;
          }
        }
      } catch (e) {
        console.warn("Silent re-auth for sync queue pass failed:", e);
      }
    }
  }

  let successCount = 0;
  let failCount = 0;

  try {
    for (const item of [...queue]) {
      try {
        const data = await prepareRequestData(item);
        const headers = item.isFormData ? { "Content-Type": undefined } : {};

        // Execute API request
        const response = await apiClient({
          method: item.method,
          url: item.url,
          data,
          headers,
        });

        // If backend returned a saved entity, update local optimistic record
        const serverData = response.data?.data;
        if (serverData && item.entityType) {
          await updateLocalRecordWithServer(item.entityType, item.localId, serverData);
        }

        // Successfully synced -> dequeue
        dequeueMutation(item.id);
        successCount++;
      } catch (error) {
        console.error(`Sync failed for item ${item.id} (${item.label}):`, error);

        const status = error.response?.status;
        const isAuthError = status === 401 || status === 403;
        const isSyntaxError = status === 400 || status === 422;

        // If auth error occurred, attempt single recovery with credentials
        if (isAuthError && !item._triedReauth) {
          item._triedReauth = true;
          try {
            const user = JSON.parse(localStorage.getItem("user") || "null");
            const email = user?.email?.toLowerCase();
            if (email && OFFLINE_PASSWORDS[email]) {
              const loginRes = await apiClient.post("/auth/login", {
                email,
                password: OFFLINE_PASSWORDS[email],
                isNativeApp: true,
              });
              if (loginRes.data?.token) {
                localStorage.setItem("token", loginRes.data.token);
                localStorage.setItem("real_server_token", loginRes.data.token);
                // Retry once
                const data = await prepareRequestData(item);
                const headers = item.isFormData ? { "Content-Type": undefined } : {};
                const retryRes = await apiClient({
                  method: item.method,
                  url: item.url,
                  data,
                  headers,
                });
                const serverData = retryRes.data?.data;
                if (serverData && item.entityType) {
                  await updateLocalRecordWithServer(item.entityType, item.localId, serverData);
                }
                dequeueMutation(item.id);
                successCount++;
                continue;
              }
            }
          } catch (retryErr) {
            console.warn("Re-auth retry failed:", retryErr);
          }
        }

        // Never drop pending mutations on temporary auth or network errors
        if (isSyntaxError && (item.retries || 0) >= 3) {
          console.warn(`Dropping permanently invalid mutation [${status}]:`, item);
          dequeueMutation(item.id);
        } else if (!isAuthError && status && status >= 400 && status < 500 && status !== 404 && status !== 408 && status !== 429) {
          console.warn(`Dropping permanently invalid mutation [${status}]:`, item);
          dequeueMutation(item.id);
        } else {
          // Increment retry count and stop this queue pass to preserve sequential execution
          item.retries = (item.retries || 0) + 1;
          const currentQueue = getStoredQueue();
          const itemIndex = currentQueue.findIndex((q) => q.id === item.id);
          if (itemIndex >= 0) currentQueue[itemIndex] = item;
          setStoredQueue(currentQueue);
          failCount++;
          break; // Stop on first network/auth failure to preserve ordering
        }
      }
    }
  } finally {
    isSyncing = false;
    const remaining = getStoredQueue().length;
    notifySyncStatus({
      isSyncing: false,
      pendingCount: remaining,
      lastSynced: new Date(),
    });

    if (successCount > 0) {
      toast.success(
        `Successfully synced ${successCount} offline change${successCount > 1 ? "s" : ""} to server!`,
        { id: "sync-success" }
      );
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("minesight:sync-completed"));
      }
    }
  }

  return { success: failCount === 0, processed: successCount, remaining: getStoredQueue().length };
}

// Update local entity when server assigns permanent ID
async function updateLocalRecordWithServer(entityType, localId, serverData) {
  try {
    const serverId = serverData?._id;
    if (localId && serverId && localId !== serverId) {
      // Reconcile remaining queued actions that reference this localId
      const currentQueue = getStoredQueue();
      let updatedQueue = false;
      for (const qItem of currentQueue) {
        if (qItem.localId === localId) {
          qItem.localId = serverId;
          updatedQueue = true;
        }
        if (typeof qItem.url === "string" && qItem.url.includes(localId)) {
          qItem.url = qItem.url.split(localId).join(serverId);
          updatedQueue = true;
        }
      }
      if (updatedQueue) {
        setStoredQueue(currentQueue);
      }
    }

    switch (entityType) {
      case "inspections": {
        if (localId && localId !== serverData._id) {
          await offlineStorage.deleteInspection(localId);
        }
        await offlineStorage.saveInspection({ ...serverData, _pendingSync: false, _isOffline: false });
        break;
      }
      case "mines": {
        if (localId && localId !== serverData._id) {
          await offlineStorage.deleteMine(localId);
        }
        await offlineStorage.saveMine({ ...serverData, _pendingSync: false, _isOffline: false });
        break;
      }
      case "compliances": {
        if (localId && localId !== serverData._id) {
          await offlineStorage.deleteCompliance(localId);
        }
        await offlineStorage.saveCompliance({ ...serverData, _pendingSync: false, _isOffline: false });
        break;
      }
      case "contractors": {
        if (localId && localId !== serverData._id) {
          await offlineStorage.deleteContractor(localId);
        }
        await offlineStorage.saveContractor({ ...serverData, _pendingSync: false, _isOffline: false });
        break;
      }
      case "attendance": {
        if (localId && localId !== serverData._id) {
          await offlineStorage.deleteAttendance(localId);
        }
        await offlineStorage.saveAttendance({ ...serverData, _pendingSync: false, _isOffline: false });
        break;
      }
      case "supportTickets": {
        if (localId && localId !== serverData._id) {
          await offlineStorage.deleteSupportTicket(localId);
        }
        await offlineStorage.saveSupportTicket({ ...serverData, _pendingSync: false, _isOffline: false });
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.warn("Failed to reconcile local entity with server:", err);
  }
}

// Setup auto-sync listeners when online event triggers
export function initAutoSync(apiClient) {
  if (typeof window === "undefined") return;

  const triggerBackgroundSync = async () => {
    const isOnline = getNetworkStatus();
    if (!isOnline && typeof navigator !== "undefined" && !navigator.onLine) return;
    if (getStoredQueue().length === 0) return;
    try {
      await processSyncQueue(apiClient);
    } catch (e) {
      console.warn("Auto-sync attempt:", e);
    }
  };

  let wasOffline = false;

  const handleOffline = () => {
    if (typeof document !== "undefined" && (document.hidden || document.visibilityState === "hidden")) {
      return;
    }
    wasOffline = true;
  };

  const syncAfterReconnect = async () => {
    const retryDelays = [1000, 2500, 5000];

    // Only toast if previously recorded as offline
    if (wasOffline) {
      if (getStoredQueue().length > 0) {
        toast("Internet restored. Synchronizing data...", { icon: "🔄", id: "sync-online" });
      }
      wasOffline = false;
    }

    // Instantly notify listeners and views to refresh
    notifySyncStatus({ isSyncing: false, pendingCount: getStoredQueue().length, lastSynced: new Date() });
    window.dispatchEvent(new CustomEvent("minesight:sync-completed"));

    for (const delay of [0, ...retryDelays]) {
      if (delay > 0) {
        await new Promise((resolve) => {
          retryTimer = window.setTimeout(resolve, delay);
        });
      }

      const isOnline = getNetworkStatus();
      if (!isOnline && typeof navigator !== "undefined" && !navigator.onLine) return;

      if (getStoredQueue().length > 0) {
        const result = await processSyncQueue(apiClient);
        if (result.success || !getStoredQueue().length) {
          window.dispatchEvent(new CustomEvent("minesight:sync-completed"));
          return;
        }
      } else {
        window.dispatchEvent(new CustomEvent("minesight:sync-completed"));
        return;
      }
    }
  };

  const handleOnline = () => {
    if (retryTimer) window.clearTimeout(retryTimer);
    syncAfterReconnect();
  };

  const handleNetworkEvent = (e) => {
    if (e.detail?.isOnline) {
      handleOnline();
    } else {
      handleOffline();
    }
  };

  const handleVisibilityOrFocus = () => {
    if (document.visibilityState === "visible" || document.hasFocus()) {
      triggerBackgroundSync();
    }
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);
  window.addEventListener("minesight:network-status", handleNetworkEvent);
  window.addEventListener("visibilitychange", handleVisibilityOrFocus);
  window.addEventListener("focus", handleVisibilityOrFocus);

  const unsubNetwork = subscribeNetworkStatus((isOnline) => {
    if (isOnline) handleOnline();
  });

  // Native app resume listener - sync quietly in background
  let appStateListener = null;
  if (Capacitor.isNativePlatform() || window.AndroidBridge) {
    CapApp.addListener("appStateChange", (state) => {
      if (state.isActive) {
        triggerBackgroundSync();
      }
    }).then((handle) => {
      appStateListener = handle;
    });
  }

  // Periodic polling sync check every 10 seconds if items are queued and online
  const periodicSyncInterval = setInterval(() => {
    const isOnline = getNetworkStatus();
    if (isOnline && getStoredQueue().length > 0 && !isSyncing) {
      processSyncQueue(apiClient);
    }
  }, 10000);

  // If already online and queue has items, attempt sync after 1.5 seconds
  if (getNetworkStatus() && getStoredQueue().length > 0) {
    setTimeout(() => {
      processSyncQueue(apiClient);
    }, 1500);
  }

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
    window.removeEventListener("minesight:network-status", handleNetworkEvent);
    window.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    window.removeEventListener("focus", handleVisibilityOrFocus);
    unsubNetwork();
    clearInterval(periodicSyncInterval);
    if (appStateListener) appStateListener.remove();
    if (retryTimer) window.clearTimeout(retryTimer);
  };
}
