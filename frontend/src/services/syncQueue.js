// syncQueue.js - Offline-First Mutation Queue and Automatic Sync Engine

import { offlineStorage, saveOfflineMedia, getOfflineMedia } from "./offlineStorage";
import toast from "react-hot-toast";

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

  const queueItem = {
    id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    method: method.toUpperCase(),
    url,
    payload,
    isFormData,
    files,
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
        let blob = mediaData;
        if (typeof mediaData === "string" && mediaData.startsWith("data:")) {
          // Convert data URI back to Blob
          const res = await fetch(mediaData);
          blob = await res.blob();
        }
        formData.append(
          fileDef.fieldName,
          blob,
          fileDef.fileName || `${fileDef.fieldName}-${Date.now()}.bin`
        );
      }
    }
  }

  return formData;
}

// Process all pending queued mutations sequentially
export async function processSyncQueue(apiClient) {
  if (isSyncing) return { success: false, message: "Sync already in progress" };
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { success: false, message: "Device is offline" };
  }

  const queue = getStoredQueue();
  if (!queue.length) {
    notifySyncStatus({ isSyncing: false, pendingCount: 0, lastSynced: new Date() });
    return { success: true, processed: 0 };
  }

  isSyncing = true;
  notifySyncStatus({ isSyncing: true, pendingCount: queue.length });

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

        // If it's a client error (4xx except 408/429), it won't succeed on retry, dequeue to avoid blocking
        const status = error.response?.status;
        if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
          console.warn(`Dropping permanently invalid mutation [${status}]:`, item);
          dequeueMutation(item.id);
        } else {
          // Network error or server 5xx: increment retry and stop queue processing for now
          item.retries = (item.retries || 0) + 1;
          const currentQueue = getStoredQueue();
          const itemIndex = currentQueue.findIndex((q) => q.id === item.id);
          if (itemIndex >= 0) currentQueue[itemIndex] = item;
          setStoredQueue(currentQueue);
          failCount++;
          break; // Stop on first network failure to preserve ordering
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
    }
  }

  return { success: failCount === 0, processed: successCount, remaining: getStoredQueue().length };
}

// Update local entity when server assigns permanent ID
async function updateLocalRecordWithServer(entityType, localId, serverData) {
  try {
    switch (entityType) {
      case "inspections": {
        if (localId && localId !== serverData._id) {
          await offlineStorage.deleteInspection(localId);
        }
        await offlineStorage.saveInspection({ ...serverData, _pendingSync: false, _isOffline: false });
        break;
      }
      case "mines": {
        await offlineStorage.saveMine({ ...serverData, _pendingSync: false, _isOffline: false });
        break;
      }
      case "compliances": {
        await offlineStorage.saveCompliance({ ...serverData, _pendingSync: false, _isOffline: false });
        break;
      }
      case "contractors": {
        await offlineStorage.saveContractor({ ...serverData, _pendingSync: false, _isOffline: false });
        break;
      }
      case "attendance": {
        await offlineStorage.saveAttendance({ ...serverData, _pendingSync: false, _isOffline: false });
        break;
      }
      case "supportTickets": {
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

  const handleOnline = () => {
    toast("Internet restored. Starting auto-sync...", { icon: "🔄", id: "sync-online" });
    processSyncQueue(apiClient);
  };

  window.addEventListener("online", handleOnline);

  // If already online and queue has items, attempt sync after 2 seconds
  if (navigator.onLine && getStoredQueue().length > 0) {
    setTimeout(() => {
      processSyncQueue(apiClient);
    }, 2000);
  }

  return () => {
    window.removeEventListener("online", handleOnline);
  };
}
