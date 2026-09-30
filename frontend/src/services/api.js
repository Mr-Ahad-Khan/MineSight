import axios from "axios";
import {
  getApiCacheKey,
  getOfflineCacheScope,
  getOfflineMutations,
  notifyCachedResponse,
  queueOfflineMutation,
  readApiCache,
  removeOfflineMutation,
  saveApiResponse,
  clearOfflineCache,
} from "./offlineCache";

// 1. Resolve and sanitize the base URL to prevent double slashes or broken paths
const rawBackendUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_URI ||
  import.meta.env.VITE_API_URL;

// Strip trailing slashes and normalize the endpoint
let apiBaseUrl = "";

if (rawBackendUrl) {
  const cleanUrl = rawBackendUrl.replace(/\/+$/, "");
  // If the URL already ends with /api, use it as-is, otherwise append /api
  apiBaseUrl = cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
} else {
  // Fallbacks: Development uses localhost, Production points directly to Render
  apiBaseUrl = import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "https://minesight.onrender.com/api";
}

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

let offlineSyncPromise;

// Request interceptor - add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.method?.toLowerCase() === "get") {
      config.__offlineCacheKey = getApiCacheKey(config);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (response.config?.__offlineCacheKey) {
      void saveApiResponse(response).catch(() => {});
      notifyCachedResponse("minesight:api-live", {
        key: response.config.__offlineCacheKey,
      });
    }
    return response;
  },
  async (error) => {
    const config = error.config;
    if (
      config &&
      !config.__offlineReplay &&
      config.method?.toLowerCase() !== "get" &&
      !error.response &&
      typeof navigator !== "undefined" &&
      !navigator.onLine
    ) {
      try {
        await queueOfflineMutation(config);
        error.isOfflineQueued = true;
        error.response = {
          data: {
            message: "Saved on this device. It will sync automatically when connection returns.",
          },
          status: 202,
        };
        return Promise.reject(error);
      } catch (queueError) {
        if (queueError.message === "This action requires a live connection.") {
          error.response = {
            data: { message: queueError.message },
            status: 503,
          };
        }
      }
    }

    const cacheKey = error.config?.__offlineCacheKey;
    if (cacheKey && (!error.response || error.response.status >= 500)) {
      try {
        const cachedResponse = await readApiCache(cacheKey);
        if (cachedResponse) {
          notifyCachedResponse("minesight:api-cache-hit", {
            key: cacheKey,
            updatedAt: cachedResponse.updatedAt,
          });
          return {
            data: cachedResponse.data,
            status: cachedResponse.status,
            statusText: cachedResponse.statusText,
            headers: cachedResponse.headers,
            config: error.config,
            request: null,
            cachedOffline: true,
          };
        }
      } catch {
        // A cache failure should not hide the original API error.
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;

export function syncOfflineMutations() {
  if (typeof navigator === "undefined" || !navigator.onLine) {
    return Promise.resolve(0);
  }
  if (offlineSyncPromise) return offlineSyncPromise;

  offlineSyncPromise = (async () => {
    const records = await getOfflineMutations();
    let syncedCount = 0;
    if (records.length > 0) {
      notifyCachedResponse("minesight:offline-queue-updated", {
        count: records.length,
        syncing: true,
      });
    }

    for (const record of records) {
      let data = record.data;
      if (record.isFormData) {
        data = new FormData();
        record.data.forEach(({ name, value, filename }) => {
          if (filename) data.append(name, value, filename);
          else data.append(name, value);
        });
      }

      try {
        await api.request({
          url: record.url,
          method: record.method,
          params: record.params,
          data,
          headers: record.headers,
          __offlineReplay: true,
        });
        await removeOfflineMutation(record.id);
        syncedCount += 1;
      } catch {
        break;
      }
    }

    if (syncedCount > 0) {
      await clearOfflineCache(getOfflineCacheScope());
    }
    const remaining = await getOfflineMutations();
    notifyCachedResponse("minesight:offline-queue-updated", {
      count: remaining.length,
      syncing: false,
    });
    if (syncedCount > 0) {
      notifyCachedResponse("minesight:offline-queue-synced", {
        syncedCount,
        remainingCount: remaining.length,
      });
    }
    return syncedCount;
  })()
    .catch(() => 0)
    .finally(() => {
      offlineSyncPromise = null;
    });

  return offlineSyncPromise;
}

// Resolve media stored by the API without ever falling back to localhost in a
// deployed build. This keeps voice notes and inspection photos usable on Vercel.
export const getMediaUrl = (mediaPath) => {
  if (!mediaPath) return null;

  const path =
    typeof mediaPath === "string" ? mediaPath : mediaPath.url || mediaPath.path;
  if (!path || typeof path !== "string") return null;
  if (/^https?:\/\//i.test(path)) return path;

  const origin = apiBaseUrl.replace(/\/api\/?$/, "");
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
};

// Auth
export const login = (data) => api.post("/auth/login", data);
export const register = (data) => api.post("/auth/register", data);
export const getMe = () => api.get("/auth/me");
export const updateProfile = (data) => {
  if (data instanceof FormData) {
    return api.put("/auth/profile", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return api.put("/auth/profile", data);
};
export const requestEmailOtp = (data) =>
  api.post("/auth/email/request-otp", data);
export const verifyEmailOtp = (data) =>
  api.post("/auth/email/verify-otp", data);

// Dashboard
export const getDashboardSummary = () => api.get("/dashboard/summary");
export const getAnalytics = (params) =>
  api.get("/dashboard/analytics", { params });
export const getPublicHomeStats = () => api.get("/public/home-stats");
export const saveChatMessage = (data) =>
  api.post("/public/chat-messages", data);

// Mines
export const getMines = (params) => api.get("/mines", { params });
export const getMine = (id) => api.get(`/mines/${id}`);
export const createMine = (data) => api.post("/mines", data);
export const updateMine = (id, data) => api.put(`/mines/${id}`, data);
export const getMineralResourceSummary = () => api.get("/mineral-resources");
export const getMineralResourceRecords = (params) =>
  api.get("/mineral-resources/records", { params });

// Inspections
export const getInspections = (params) => api.get("/inspections", { params });
export const getInspection = (id) => api.get(`/inspections/${id}`);
export const getInspectionAuditHistory = (id) => api.get(`/inspections/${id}/audit`);
export const createInspection = (data) => {
  if (data instanceof FormData) {
    return api.post("/inspections", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return api.post("/inspections", data);
};
export const updateInspection = (id, data) =>
  api.put(`/inspections/${id}`, data);
export const deleteInspection = (id) => api.delete(`/inspections/${id}`);
export const closeViolation = (id, violationId) =>
  api.patch(`/inspections/${id}/violations/${violationId}`);

// Compliances
export const getCompliances = (params) => api.get("/compliances", { params });
export const getOverdueCompliances = () => api.get("/compliances/overdue");
export const createCompliance = (data) => api.post("/compliances", data);
export const updateCompliance = (id, data) =>
  api.put(`/compliances/${id}`, data);

// Alerts
export const getAlerts = (params) => api.get("/alerts", { params });
export const markAlertRead = (id) => api.patch(`/alerts/${id}/read`);
export const markAllAlertsRead = () => api.patch("/alerts/read-all");

// Contractors
export const getContractors = (params) => api.get("/contractors", { params });
export const createContractor = (data) => api.post("/contractors", data);
export const updateContractor = (id, data) =>
  api.put(`/contractors/${id}`, data);

// Workers
export const getWorkerSummary = () => api.get("/workers/summary");
export const markWorkerAttendance = (data) =>
  api.post("/workers/attendance", data);
export const createWorkerTask = (data) => api.post("/workers/tasks", data);
export const updateWorkerTask = (id, data) =>
  api.patch(`/workers/tasks/${id}`, data);
export const reassignPendingWorkerTasks = (workerId) =>
  api.post(`/workers/${workerId}/reassign-pending`);

// Attendance & Real-Time Presence
export const getRealtimeAttendance = (params) =>
  api.get("/attendance/realtime", { params });
export const getAttendance = (params) => api.get("/attendance", { params });
export const markCheckIn = (data) => api.post("/attendance/check-in", data);
export const markCheckOut = (id) => api.post(`/attendance/${id}/check-out`);
export const updateAttendanceLiveStatus = (id, data) =>
  api.patch(`/attendance/${id}/live-status`, data);

// Support & Emergency Panel
export const getSupportDirectory = () => api.get("/support/directory");
export const getSupportTickets = (params) =>
  api.get("/support/tickets", { params });
export const getSupportTicket = (id) => api.get(`/support/tickets/${id}`);
export const createSupportTicket = (data) => api.post("/support/tickets", data);
export const replySupportTicket = (id, data) =>
  api.post(`/support/tickets/${id}/responses`, data);
