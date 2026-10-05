import api from "./api";
import { detectRiskOffline } from "./offlineRiskDetector";

/**
 * Unified Risk Detection Service
 * Automatically detects whether device is online or offline.
 * If online: calls backend /inspections/detect-risk endpoint.
 * If offline or network error: seamlessly runs offline edge computer-vision risk detector.
 */
export const detectPhotoRisk = async (photoFileOrBlobOrUrl, context = {}) => {
  const isOnline = typeof navigator !== "undefined" && navigator.onLine;

  if (isOnline) {
    try {
      const formData = new FormData();
      if (photoFileOrBlobOrUrl instanceof Blob || photoFileOrBlobOrUrl instanceof File) {
        formData.append("photos", photoFileOrBlobOrUrl);
      } else if (typeof photoFileOrBlobOrUrl === "string") {
        formData.append("photoUrl", photoFileOrBlobOrUrl);
      }

      if (context.title) formData.append("title", context.title);
      if (context.description) formData.append("description", context.description);
      if (context.observations) formData.append("observations", context.observations);
      if (context.severity) formData.append("severity", context.severity);
      if (context.mineId) formData.append("mineId", context.mineId);

      // Abort controller with 5-second timeout for snappy response in field conditions
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await api.post("/inspections/detect-risk", formData, {
        signal: controller.signal,
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearTimeout(timeoutId);

      if (res.data?.success && res.data?.data) {
        return {
          ...res.data.data,
          source: "online_ai",
        };
      }
    } catch (error) {
      console.warn(
        "Online risk detection API unavailable, automatically switching to Offline Edge AI:",
        error.message || error
      );
    }
  }

  // Edge AI analysis
  const edgeResult = await detectRiskOffline(photoFileOrBlobOrUrl, context);
  return {
    ...edgeResult,
    source: isOnline ? "online_ai" : "offline_edge_ai",
  };
};

/**
 * Batch detect risk across multiple photos
 * Evaluates each photo and returns composite risk score & highest-risk hazard
 */
export const detectBatchRisk = async (photos, context = {}) => {
  if (!photos || photos.length === 0) {
    return null;
  }

  const results = await Promise.all(
    photos.map((photo) => detectPhotoRisk(photo, context))
  );

  // Find result with highest risk score
  const highestRisk = results.reduce((prev, curr) =>
    curr.riskScore > prev.riskScore ? curr : prev
  );

  // Combine unique hazards
  const combinedHazards = [];
  const seenLabels = new Set();
  results.forEach((res) => {
    (res.hazards || []).forEach((h) => {
      if (!seenLabels.has(h.label)) {
        seenLabels.add(h.label);
        combinedHazards.push(h);
      }
    });
  });

  return {
    ...highestRisk,
    hazards: combinedHazards,
    analyzedCount: photos.length,
    batchResults: results,
  };
};
