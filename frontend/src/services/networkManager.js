// networkManager.js - Accurate cross-platform network state detection and management

import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";

let currentIsOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
let isVerifying = false;
let statusListeners = [];

export function getNetworkStatus() {
  if (
    typeof window !== "undefined" &&
    window.AndroidBridge?.isNetworkConnected
  ) {
    try {
      return Boolean(window.AndroidBridge.isNetworkConnected());
    } catch (e) {
      // fallback
    }
  }
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

export function subscribeNetworkStatus(listener) {
  statusListeners.push(listener);
  listener(currentIsOnline);
  return () => {
    statusListeners = statusListeners.filter((l) => l !== listener);
  };
}

function notifyStatus(isOnline) {
  if (currentIsOnline === isOnline) return;
  currentIsOnline = isOnline;

  statusListeners.forEach((l) => {
    try {
      l(isOnline);
    } catch (e) {
      console.warn("Network listener error:", e);
    }
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("minesight:network-status", {
        detail: { isOnline },
      }),
    );
  }
}

export async function verifyRealConnectivity() {
  if (isVerifying) return currentIsOnline;
  isVerifying = true;

  try {
    // 1. Android Native ConnectivityManager Check
    if (
      typeof window !== "undefined" &&
      window.AndroidBridge?.isNetworkConnected
    ) {
      const isConnected = Boolean(window.AndroidBridge.isNetworkConnected());
      if (!isConnected) {
        notifyStatus(false);
        return false;
      }
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      notifyStatus(false);
      return false;
    }

    // 2. Active quick ping check
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const checkUrl = `https://minesight.onrender.com/api/health?t=${Date.now()}`;
    const res = await fetch(checkUrl, {
      method: "HEAD",
      cache: "no-cache",
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeout);

    // If server responded with any HTTP status (even 401/403/200), internet is reachable!
    if (res && res.status > 0) {
      notifyStatus(true);
      return true;
    }

    // Fallback check against a reliable public CDN
    const cdnController = new AbortController();
    const cdnTimeout = setTimeout(() => cdnController.abort(), 3000);
    const cdnRes = await fetch("https://www.gstatic.com/generate_204", {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-cache",
      signal: cdnController.signal,
    }).catch(() => null);

    clearTimeout(cdnTimeout);

    const hasInternet = Boolean(cdnRes);
    notifyStatus(hasInternet);
    return hasInternet;
  } catch {
    notifyStatus(false);
    return false;
  } finally {
    isVerifying = false;
  }
}

// Signal from API client when requests fail or succeed
export function reportNetworkError() {
  if (typeof document !== "undefined" && document.hidden) return; // Ignore background errors
  notifyStatus(false);
}

export function reportNetworkSuccess() {
  notifyStatus(true);
}

let initialized = false;

// Initialize system-wide network listeners
export function initNetworkManager() {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;

  const handleOnline = () => {
    notifyStatus(true);
    verifyRealConnectivity();
  };

  const handleOffline = () => {
    if (document.hidden || document.visibilityState === "hidden") {
      return;
    }
    notifyStatus(false);
  };

  const handleNativeBridgeEvent = (e) => {
    if (typeof e.detail?.isOnline === "boolean") {
      notifyStatus(e.detail.isOnline);
    }
  };

  const handleResumeOrFocus = () => {
    if (document.visibilityState === "visible") {
      if (window.AndroidBridge?.isNetworkConnected) {
        notifyStatus(window.AndroidBridge.isNetworkConnected());
      } else if (typeof navigator !== "undefined") {
        notifyStatus(navigator.onLine);
      }
      setTimeout(verifyRealConnectivity, 500);
    }
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);
  window.addEventListener("minesight:network-status", handleNativeBridgeEvent);
  document.addEventListener("visibilitychange", handleResumeOrFocus);
  window.addEventListener("focus", handleResumeOrFocus);

  // Native Capacitor App Resume listener
  if (
    Capacitor.isNativePlatform?.() ||
    Boolean(window.Capacitor?.isNativePlatform?.()) ||
    Boolean(window.AndroidBridge)
  ) {
    try {
      CapApp.addListener("appStateChange", (state) => {
        if (state.isActive) {
          handleResumeOrFocus();
        }
      });
    } catch (e) {
      console.warn("CapApp listener error:", e);
    }
  }

  // Periodic connectivity verification (every 15s) when window is active
  setInterval(() => {
    if (typeof document !== "undefined" && document.visibilityState === "visible") {
      const status = getNetworkStatus();
      if (status !== currentIsOnline) {
        notifyStatus(status);
      }
    }
  }, 15000);

  // Initial check
  currentIsOnline = getNetworkStatus();
  setTimeout(verifyRealConnectivity, 1000);
}
