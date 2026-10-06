// platform.js - Reliable native mobile app detection for MineSight
import { Capacitor } from "@capacitor/core";

export function isNativeMobileApp() {
  if (typeof window === "undefined") return false;

  return Boolean(
    Capacitor.isNativePlatform?.() ||
    window.AndroidBridge ||
    window.Capacitor?.isNativePlatform?.() ||
    window.Capacitor?.getPlatform?.() === "android" ||
    window.Capacitor?.getPlatform?.() === "ios" ||
    window.location.protocol === "capacitor:" ||
    window.location.protocol === "ionic:" ||
    (window.location.hostname === "localhost" &&
      typeof navigator !== "undefined" &&
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent))
  );
}

export const isNativeApp = isNativeMobileApp();
