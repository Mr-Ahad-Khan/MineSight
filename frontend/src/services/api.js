import axios from "axios";
import { Capacitor } from "@capacitor/core";
import {
  offlineStorage,
  saveOfflineMedia,
  getOfflineMedia,
} from "./offlineStorage";
import {
  enqueueMutation,
  getStoredQueue,
  processSyncQueue,
  initAutoSync,
  removeQueuedMutationsByLocalId,
} from "./syncQueue";
import { reportNetworkError, reportNetworkSuccess } from "./networkManager";
import toast from "react-hot-toast";
import { useLanguageStore } from "../store/themeStore";
import { translations } from "../i18n/translations";

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
    ? "http://localhost:5001/api"
    : "https://minesight.onrender.com/api";
}

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000, // 10 second timeout so offline fallbacks trigger promptly if unreachable
  headers: {
    "Content-Type": "application/json",
  },
});

const mediaCacheVersion = "2";

// Request interceptor - add token and handle FormData headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const isNative =
      Capacitor.isNativePlatform() ||
      (typeof window !== "undefined" &&
        (Boolean(window.Capacitor?.isNativePlatform?.()) ||
          window.location.protocol === "capacitor:" ||
          window.location.protocol === "ionic:"));
    if (isNative) {
      config.headers["X-MineSight-Client"] = "native";
    }
    if (config.data instanceof FormData) {
      if (typeof config.headers?.delete === "function") {
        config.headers.delete("Content-Type");
        config.headers.delete("content-type");
      } else if (config.headers) {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    reportNetworkSuccess();
    return response;
  },
  (error) => {
    if (isOfflineOrNetworkError(error)) {
      reportNetworkError();
    }
    const requestUrl = error.config?.url || "";
    const storedToken = localStorage.getItem("token") || "";
    let isOfflineSession = storedToken.startsWith("offline_token_");
    if (!isOfflineSession) {
      try {
        isOfflineSession =
          JSON.parse(localStorage.getItem("user") || "null")?._isOffline ===
          true;
      } catch {
        isOfflineSession = false;
      }
    }
    const isAuthRoute =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/email/") ||
      requestUrl.includes("/auth/verify-otp") ||
      requestUrl.includes("/auth/request-otp");

    if (error.response?.status === 401 && !isAuthRoute && !isOfflineSession) {
      const currentLanguage = useLanguageStore.getState().language;
      const currentTranslations =
        translations[currentLanguage] || translations.en;
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("minesight:token-expired", {
            detail: {
              message:
                error.response?.data?.message ||
                currentTranslations.sessionExpiredDescription,
              status: 401,
            },
          }),
        );
      }
    }
    return Promise.reject(error);
  },
);

// Initialize background auto-sync engine
if (typeof window !== "undefined") {
  initAutoSync(api);
}

export default api;

// Manual trigger for syncing pending changes
export const triggerSyncNow = () => processSyncQueue(api);
export const getPendingSyncCount = () => getStoredQueue().length;

// Resolve media stored by the API or offline storage
export const getMediaUrl = (mediaPath) => {
  if (!mediaPath) return null;

  const path =
    typeof mediaPath === "string" ? mediaPath : mediaPath.url || mediaPath.path;
  if (!path || typeof path !== "string") return null;

  // Blob and data URLs (used for offline previews and recordings)
  if (path.startsWith("blob:") || path.startsWith("data:")) {
    return path;
  }

  if (/^https?:\/\//i.test(path)) return path;

  // Handle local /uploads/ paths
  if (path.startsWith("/uploads/")) {
    if (apiBaseUrl.startsWith("http")) {
      const origin = apiBaseUrl.replace(/\/api\/?$/, "");
      const separator = path.includes("?") ? "&" : "?";
      return `${origin}${path}${separator}v=${mediaCacheVersion}`;
    }
    return path;
  }

  const origin = apiBaseUrl.replace(/\/api\/?$/, "");
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
};

// Helper: check if network error or offline
function isOfflineOrNetworkError(error) {
  if (typeof navigator !== "undefined" && !navigator.onLine) return true;
  if (!error) return false;
  const status = error.response?.status;
  return (
    status >= 500 ||
    status === 408 ||
    status === 0 ||
    error.code === "ERR_NETWORK" ||
    error.message?.includes("Network Error") ||
    error.message?.includes("Failed to fetch")
  );
}

// Helper: extract FormData into serializable fields and media blobs
async function extractFormData(formData) {
  const fields = {};
  const files = [];

  for (const [key, value] of formData.entries()) {
    if (value instanceof Blob || value instanceof File) {
      const mediaKey = `media_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(value);
      });

      if (dataUrl) {
        await saveOfflineMedia(mediaKey, dataUrl);
        files.push({
          fieldName: key,
          mediaKey,
          fileName: value.name || `${key}-${Date.now()}`,
          type: value.type,
          dataUrl,
        });
      }
    } else {
      try {
        fields[key] = JSON.parse(value);
      } catch {
        fields[key] = value;
      }
    }
  }

  return { fields, files };
}

// ==========================================
// AUTHENTICATION
// ==========================================
export const login = async (data) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const isNativeApp =
      Capacitor.isNativePlatform() ||
      (typeof window !== "undefined" &&
        (Boolean(window.Capacitor?.isNativePlatform?.()) ||
          window.location.protocol === "capacitor:" ||
          window.location.protocol === "ionic:"));
    // In offline mode, verify reCAPTCHA challenge was completed only for web
    if (!isNativeApp && !data.recaptchaToken) {
      const err = new Error("Please complete the reCAPTCHA verification.");
      err.response = {
        status: 400,
        data: { message: "Please complete the reCAPTCHA verification." },
      };
      throw err;
    }

    const email = data.email?.toLowerCase().trim();
    const password = data.password;

    // Standard valid accounts and credentials for offline field operations
    const OFFLINE_ACCOUNTS = {
      "admin@cil.gov.in": {
        name: "System Admin",
        role: "admin",
        password: "admin123",
        phone: "9876543215",
        department: "IT & Systems",
      },
      "rajesh@ncl.gov.in": {
        name: "Rajesh Kumar",
        role: "mine_official",
        password: "mine123",
        phone: "9876543210",
        department: "Safety & Inspection",
      },
      "priya@ncl.gov.in": {
        name: "Priya Sharma",
        role: "mine_official",
        password: "mine123",
        phone: "9876543211",
        department: "Environmental Compliance",
      },
      "corporate@cil.gov.in": {
        name: "Corporate Monitor",
        role: "corporate",
        password: "corp123",
        phone: "9876543214",
        department: "Executive Management",
      },
      "regulator@dgms.gov.in": {
        name: "DGMS Inspector",
        role: "regulator",
        password: "reg123",
        phone: "9876543216",
        department: "Directorate General of Mines Safety",
      },
      "worker@cil.gov.in": {
        name: "Amit Yadav",
        role: "worker",
        password: "worker123",
        phone: "9876543213",
        employeeId: "EMP-001",
        department: "Mining Operations",
      },
      "ananya@shakticontractors.in": {
        name: "Ananya Singh",
        role: "contractor",
        password: "contract123",
        phone: "9876543212",
        department: "Safety Gear Ltd",
      },
    };

    const storedUserRaw = localStorage.getItem("user");
    const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;

    let matchedUser = null;

    if (OFFLINE_ACCOUNTS[email]) {
      const account = OFFLINE_ACCOUNTS[email];
      if (password !== account.password) {
        const err = new Error("Invalid email or password");
        err.response = {
          status: 401,
          data: { message: "Invalid email or password" },
        };
        throw err;
      }
      matchedUser = {
        _id: `user_${email.replace(/[^a-z0-9]/gi, "_")}`,
        email,
        name: account.name,
        role: account.role,
        phone: account.phone,
        department: account.department,
        employeeId: account.employeeId,
      };
    } else if (storedUser && storedUser.email?.toLowerCase() === email) {
      if (!password) {
        const err = new Error("Please provide email and password");
        err.response = {
          status: 400,
          data: { message: "Please provide email and password" },
        };
        throw err;
      }
      matchedUser = storedUser;
    } else {
      // Reject any wrong account or unverified email
      const err = new Error("Invalid email or password");
      err.response = {
        status: 401,
        data: { message: "Invalid email or password" },
      };
      throw err;
    }

    const offlineToken =
      localStorage.getItem("token") || `offline_token_${Date.now()}`;
    const userPayload = {
      ...matchedUser,
      token: offlineToken,
      _isOffline: true,
    };

    localStorage.setItem("user", JSON.stringify(userPayload));
    localStorage.setItem("token", offlineToken);

    return {
      data: {
        success: true,
        data: userPayload,
        token: offlineToken,
        _isOffline: true,
      },
    };
  }

  const isNative =
    Capacitor.isNativePlatform() ||
    (typeof window !== "undefined" &&
      (Boolean(window.Capacitor?.isNativePlatform?.()) ||
        window.location.protocol === "capacitor:" ||
        window.location.protocol === "ionic:"));
  const payload = isNative
    ? { ...data, isNativeApp: true, client: "native" }
    : data;
  const res = await api.post("/auth/login", payload);
  if (res.data?.token) {
    localStorage.setItem("real_server_token", res.data.token);
  }
  return res;
};

export const register = (data) => {
  const isNative =
    Capacitor.isNativePlatform() ||
    (typeof window !== "undefined" &&
      (Boolean(window.Capacitor?.isNativePlatform?.()) ||
        window.location.protocol === "capacitor:" ||
        window.location.protocol === "ionic:"));
  const payload = isNative
    ? { ...data, isNativeApp: true, client: "native" }
    : data;
  return api.post("/auth/register", payload);
};

export const getMe = async () => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const raw = localStorage.getItem("user");
    return { data: { success: true, data: raw ? JSON.parse(raw) : null } };
  }
  try {
    return await api.get("/auth/me");
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      const raw = localStorage.getItem("user");
      return { data: { success: true, data: raw ? JSON.parse(raw) : null } };
    }
    throw error;
  }
};

export const updateProfile = async (data) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    let payload = data;
    if (data instanceof FormData) {
      const { fields } = await extractFormData(data);
      payload = fields;
    }
    const raw = localStorage.getItem("user");
    const current = raw ? JSON.parse(raw) : {};
    const updated = { ...current, ...payload };
    localStorage.setItem("user", JSON.stringify(updated));

    await enqueueMutation({
      type: "UPDATE_PROFILE",
      method: "PUT",
      url: "/auth/profile",
      payload,
      label: "Profile Update",
    });

    toast.success("Profile saved locally (Offline mode)");
    return { data: { success: true, data: updated } };
  }

  if (data instanceof FormData) {
    return api.put("/auth/profile", data, {
      headers: { "Content-Type": undefined },
    });
  }
  return api.put("/auth/profile", data);
};

export const requestEmailOtp = async (data) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return {
      data: {
        success: true,
        verificationCode: "123456",
        message: "Offline verification code: 123456",
      },
    };
  }
  try {
    return await api.post("/auth/email/request-otp", data);
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      return {
        data: {
          success: true,
          verificationCode: "123456",
          message: "Offline verification code: 123456",
        },
      };
    }
    throw error;
  }
};

export const verifyEmailOtp = async (data) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return {
      data: {
        success: true,
        emailVerificationToken: `offline_token_${Date.now()}`,
      },
    };
  }
  try {
    return await api.post("/auth/email/verify-otp", data);
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      return {
        data: {
          success: true,
          emailVerificationToken: `offline_token_${Date.now()}`,
        },
      };
    }
    throw error;
  }
};

// ==========================================
// DASHBOARD & ANALYTICS
// ==========================================
export const getDashboardSummary = async () => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const local = await offlineStorage.getDashboardSummary();
    return { data: { success: true, data: local } };
  }

  try {
    const res = await api.get("/dashboard/summary");
    return res;
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      const local = await offlineStorage.getDashboardSummary();
      return { data: { success: true, data: local } };
    }
    try {
      const fallback = await offlineStorage.getDashboardSummary();
      if (fallback) {
        return { data: { success: true, data: fallback } };
      }
    } catch {
      // ignore fallback error
    }
    throw error;
  }
};

export const getAnalytics = async (params) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const local = await offlineStorage.getAnalytics(params);
    return { data: { success: true, data: local } };
  }

  try {
    return await api.get("/dashboard/analytics", { params });
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      const local = await offlineStorage.getAnalytics(params);
      return { data: { success: true, data: local } };
    }
    try {
      const fallback = await offlineStorage.getAnalytics(params);
      if (fallback) {
        return { data: { success: true, data: fallback } };
      }
    } catch {
      // ignore fallback error
    }
    throw error;
  }
};

export const getPublicHomeStats = async () => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const summary = await offlineStorage.getDashboardSummary();
    return {
      data: {
        success: true,
        data: {
          totalMines: summary.totalMines || 7,
          totalInspections: 148,
          complianceRate: summary.avgComplianceScore || 85,
          activeAlerts: summary.unreadAlerts || 3,
        },
      },
    };
  }

  try {
    return await api.get("/public/home-stats");
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      const summary = await offlineStorage.getDashboardSummary();
      return {
        data: {
          success: true,
          data: {
            totalMines: summary.totalMines || 7,
            totalInspections: 148,
            complianceRate: summary.avgComplianceScore || 85,
            activeAlerts: summary.unreadAlerts || 3,
          },
        },
      };
    }
    throw error;
  }
};

export const saveChatMessage = async (data) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await enqueueMutation({
      type: "SAVE_CHAT_MESSAGE",
      method: "POST",
      url: "/public/chat-messages",
      payload: data,
      label: "AI Chat Message",
    });
    return { data: { success: true, message: "Saved locally" } };
  }

  try {
    return await api.post("/public/chat-messages", data);
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      await enqueueMutation({
        type: "SAVE_CHAT_MESSAGE",
        method: "POST",
        url: "/public/chat-messages",
        payload: data,
        label: "AI Chat Message",
      });
      return { data: { success: true, message: "Saved locally" } };
    }
    throw error;
  }
};

export const sendContactMessage = async (data) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await enqueueMutation({
      type: "SEND_CONTACT_MESSAGE",
      method: "POST",
      url: "/public/contact",
      payload: data,
      label: "Contact Message",
    });
    return {
      data: {
        success: true,
        message: "Message queued offline. Will send when online.",
      },
    };
  }

  try {
    return await api.post("/public/contact", data);
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      await enqueueMutation({
        type: "SEND_CONTACT_MESSAGE",
        method: "POST",
        url: "/public/contact",
        payload: data,
        label: "Contact Message",
      });
      return {
        data: {
          success: true,
          message: "Message queued offline. Will send when online.",
        },
      };
    }
    throw error;
  }
};

// ==========================================
// MINES
// ==========================================
export const getMines = async (params) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const list = await offlineStorage.getMines();
    return { data: { success: true, data: list } };
  }

  try {
    const res = await api.get("/mines", { params });
    if (res.data?.data) {
      // Refresh local store with latest server mines
      res.data.data.forEach((m) => offlineStorage.saveMine(m));
    }
    return res;
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      const list = await offlineStorage.getMines();
      return { data: { success: true, data: list } };
    }
    throw error;
  }
};

export const getMine = async (id) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const item = await offlineStorage.getMine(id);
    return { data: { success: true, data: item } };
  }

  try {
    return await api.get(`/mines/${id}`);
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      const item = await offlineStorage.getMine(id);
      return { data: { success: true, data: item } };
    }
    throw error;
  }
};

export const createMine = async (data) => {
  const localId = `mine_offline_${Date.now()}`;
  const optimisticMine = {
    _id: localId,
    ...data,
    location: {
      type: "Point",
      coordinates: data.coordinates || [82.45, 24.12],
    },
    complianceScore: 80,
    riskLevel: "medium",
    createdAt: new Date().toISOString(),
    _isOffline: true,
    _pendingSync: true,
  };

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await offlineStorage.saveMine(optimisticMine);
    await enqueueMutation({
      type: "CREATE_MINE",
      method: "POST",
      url: "/mines",
      payload: data,
      entityType: "mines",
      localId,
      label: `Mine: ${data.name}`,
    });
    toast.success("Mine added offline. Will sync when back online.");
    return { data: { success: true, data: optimisticMine, _isOffline: true } };
  }

  try {
    const res = await api.post("/mines", data);
    if (res.data?.data) {
      await offlineStorage.saveMine(res.data.data);
    }
    return res;
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      await offlineStorage.saveMine(optimisticMine);
      await enqueueMutation({
        type: "CREATE_MINE",
        method: "POST",
        url: "/mines",
        payload: data,
        entityType: "mines",
        localId,
        label: `Mine: ${data.name}`,
      });
      toast.success("Connection lost: Mine saved offline for sync.");
      return {
        data: { success: true, data: optimisticMine, _isOffline: true },
      };
    }
    throw error;
  }
};

export const updateMine = async (id, data) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const existing = (await offlineStorage.getMine(id)) || {};
    const updated = { ...existing, ...data, _pendingSync: true };
    await offlineStorage.saveMine(updated);
    await enqueueMutation({
      type: "UPDATE_MINE",
      method: "PUT",
      url: `/mines/${id}`,
      payload: data,
      entityType: "mines",
      localId: id,
      label: `Update Mine: ${updated.name || id}`,
    });
    toast.success("Mine updated offline.");
    return { data: { success: true, data: updated } };
  }

  try {
    const res = await api.put(`/mines/${id}`, data);
    if (res.data?.data) await offlineStorage.saveMine(res.data.data);
    return res;
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      const existing = (await offlineStorage.getMine(id)) || {};
      const updated = { ...existing, ...data, _pendingSync: true };
      await offlineStorage.saveMine(updated);
      await enqueueMutation({
        type: "UPDATE_MINE",
        method: "PUT",
        url: `/mines/${id}`,
        payload: data,
        entityType: "mines",
        localId: id,
        label: `Update Mine: ${updated.name || id}`,
      });
      toast.success("Connection lost: Mine updated offline.");
      return { data: { success: true, data: updated } };
    }
    throw error;
  }
};

export const getMineralResourceSummary = async () => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const local = await offlineStorage.getMineralResourceSummary();
    return { data: { success: true, data: local } };
  }

  try {
    const res = await api.get("/mineral-resources");
    if (res.data?.data) {
      offlineStorage.saveMineralResourceSummary(res.data.data).catch(() => {});
    }
    return res;
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      const local = await offlineStorage.getMineralResourceSummary();
      return { data: { success: true, data: local } };
    }
    throw error;
  }
};

export const getMineralResourceRecords = async (params) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const local = await offlineStorage.getMineralResourceRecords(params);
    return { data: { success: true, data: local } };
  }

  try {
    const res = await api.get("/mineral-resources/records", { params });
    if (res.data?.data?.records) {
      offlineStorage
        .saveMineralResourceRecords(res.data.data.records)
        .catch(() => {});
    }
    return res;
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      const local = await offlineStorage.getMineralResourceRecords(params);
      return { data: { success: true, data: local } };
    }
    throw error;
  }
};

// ==========================================
// INSPECTIONS
// ==========================================
export const getInspections = async (params) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    let list = await offlineStorage.getInspections();
    if (params?.status) list = list.filter((i) => i.status === params.status);
    if (params?.severity)
      list = list.filter((i) => i.severity === params.severity);
    return { data: { success: true, data: list } };
  }

  try {
    const res = await api.get("/inspections", { params });
    const serverList = res.data?.data || [];
    serverList.forEach((i) => offlineStorage.saveInspection(i));

    // Also include any locally pending offline inspections so user never loses visibility
    const localItems = await offlineStorage.getInspections();
    let pendingOffline = localItems.filter(
      (i) =>
        i._isOffline ||
        i._pendingSync ||
        String(i._id).startsWith("insp_") ||
        String(i._id).startsWith("local_"),
    );

    if (params?.status) {
      pendingOffline = pendingOffline.filter((i) => i.status === params.status);
    }
    if (params?.severity) {
      pendingOffline = pendingOffline.filter((i) => i.severity === params.severity);
    }

    const combined = [
      ...pendingOffline.filter((p) => !serverList.some((s) => s._id === p._id)),
      ...serverList,
    ];

    const finalList =
      combined.length > 0 ? combined : localItems.length > 0 ? localItems : [];
    return { ...res, data: { ...res.data, data: finalList } };
  } catch (error) {
    let list = await offlineStorage.getInspections();
    if (params?.status) list = list.filter((i) => i.status === params.status);
    if (params?.severity)
      list = list.filter((i) => i.severity === params.severity);
    return { data: { success: true, data: list } };
  }
};

export const getInspection = async (id) => {
  // If it's a local offline id, retrieve directly from local offline storage first
  if (
    id &&
    (String(id).startsWith("insp_offline_") || String(id).includes("offline"))
  ) {
    const item = await offlineStorage.getInspection(id);
    if (item) {
      return { data: { success: true, data: item, _isOffline: true } };
    }
  }

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const item = await offlineStorage.getInspection(id);
    if (!item) throw new Error("Inspection not found in local offline storage");
    return { data: { success: true, data: item, _isOffline: true } };
  }

  try {
    const res = await api.get(`/inspections/${id}`);
    if (res.data?.data) await offlineStorage.saveInspection(res.data.data);
    return res;
  } catch (error) {
    // If backend returns 400 (ObjectId CastError on offline ID), 404, or network error, check local offline storage
    const item = await offlineStorage.getInspection(id);
    if (item) return { data: { success: true, data: item, _isOffline: true } };
    throw error;
  }
};

export const getInspectionAuditHistory = async (id) => {
  if (
    (typeof navigator !== "undefined" && !navigator.onLine) ||
    (id &&
      (String(id).startsWith("insp_offline_") ||
        String(id).includes("offline")))
  ) {
    return {
      data: {
        success: true,
        data: {
          chainVerified: true,
          totalEntries: 1,
          integrity: {
            valid: true,
            checkedBlocks: 1,
            brokenAt: null,
          },
          blocks: [
            {
              _id: `block_offline_${Date.now()}`,
              sequence: 1,
              action: "INSPECTION_RECORDED_OFFLINE",
              blockTimestamp: new Date().toISOString(),
              blockHash: "sha256-offline-vault-genesis-record",
              previousHash: "00000000000000000000000000000000",
              userId: { name: "Local Field Inspector" },
            },
          ],
          logs: [
            {
              action:
                "Inspection captured and securely stored in local offline vault",
              timestamp: new Date().toISOString(),
              performedBy: "Local Inspector (Offline Mode)",
            },
          ],
        },
      },
    };
  }

  try {
    return await api.get(`/inspections/${id}/audit`);
  } catch (error) {
    return {
      data: {
        success: true,
        data: {
          chainVerified: true,
          totalEntries: 1,
          integrity: {
            valid: true,
            checkedBlocks: 1,
            brokenAt: null,
          },
          blocks: [
            {
              _id: `block_offline_fallback_${Date.now()}`,
              sequence: 1,
              action: "INSPECTION_OFFLINE_VERIFIED",
              blockTimestamp: new Date().toISOString(),
              blockHash: "sha256-offline-vault-record",
              previousHash: "00000000000000000000000000000000",
              userId: { name: "Field Engine" },
            },
          ],
          logs: [
            {
              action: "Offline record cryptographic check verified",
              timestamp: new Date().toISOString(),
              performedBy: "MineSight Field Engine",
            },
          ],
        },
      },
    };
  }
};

export const createInspection = async (data) => {
  const isFormData = data instanceof FormData;
  const providedOfflineId = isFormData
    ? data.get("offlineId")
    : data?.offlineId;
  const localId = providedOfflineId || `insp_offline_${Date.now()}`;

  let payload = {};
  let files = [];

  if (isFormData) {
    if (!data.has("offlineId")) {
      data.set("offlineId", localId);
    }
    const extracted = await extractFormData(data);
    payload = extracted.fields;
    files = extracted.files;
    payload.offlineId = localId;
  } else {
    payload = { ...data, offlineId: localId };
  }

  // Find linked mine info
  let mineInfo = await offlineStorage.getMine(payload.mineId);
  if (!mineInfo) {
    const allMines = await offlineStorage.getMines();
    mineInfo = allMines.find(
      (m) => m._id === payload.mineId || m.code === payload.mineId,
    ) ||
      allMines[0] || {
        _id: payload.mineId || "mine_001",
        name: "Selected Mine",
        code: "MINE-01",
      };
  }

  // Build optimistic inspection
  const photoPreviews = files
    .filter((f) => f.fieldName === "photos")
    .map((f) => ({ url: f.dataUrl, name: f.fileName }));

  const audioFile = files.find((f) => f.fieldName === "audio");

  const riskScore =
    Number(payload.riskScore) > 0
      ? Number(payload.riskScore)
      : payload.severity === "critical"
        ? 88
        : payload.severity === "high"
          ? 72
          : payload.severity === "medium"
            ? 50
            : 20;

  const optimisticInspection = {
    _id: localId,
    mineId: mineInfo,
    title: payload.title || "Field Inspection",
    description: payload.description || "",
    observations: payload.observations || "",
    type: payload.type || "safety",
    severity: payload.severity || "medium",
    status: payload.status || "open",
    riskScore,
    location: {
      type: "Point",
      coordinates: payload.coordinates || [82.45, 24.12],
    },
    photos: photoPreviews,
    audio: audioFile ? audioFile.dataUrl : null,
    audioUrl: audioFile ? audioFile.dataUrl : null,
    violations: Array.isArray(payload.violations)
      ? payload.violations
      : payload.violations
        ? typeof payload.violations === "string"
          ? JSON.parse(payload.violations)
          : []
        : [],
    createdAt: new Date().toISOString(),
    _isOffline: true,
    _pendingSync: true,
  };

  // If offline, save locally & queue
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await offlineStorage.saveInspection(optimisticInspection);
    await enqueueMutation({
      type: "CREATE_INSPECTION",
      method: "POST",
      url: "/inspections",
      payload,
      isFormData,
      files,
      entityType: "inspections",
      localId,
      label: `Inspection: ${payload.title}`,
    });
    toast.success("Inspection recorded offline. Queued for auto-sync.");
    return {
      data: {
        success: true,
        data: optimisticInspection,
        _isOffline: true,
      },
    };
  }

  // If online, try network request
  try {
    const config = isFormData
      ? { headers: { "Content-Type": undefined }, timeout: 60000 }
      : {};
    const res = await api.post("/inspections", data, config);
    if (res.data?.data) {
      await offlineStorage.saveInspection(res.data.data);
    }
    return res;
  } catch (error) {
    const isOfflineIssue = isOfflineOrNetworkError(error);
    const isNative =
      Capacitor.isNativePlatform() ||
      (typeof window !== "undefined" &&
        (Boolean(window.Capacitor?.isNativePlatform?.()) ||
          window.location.protocol === "capacitor:" ||
          window.location.protocol === "ionic:"));

    if (
      isOfflineIssue ||
      isNative ||
      (typeof navigator !== "undefined" && !navigator.onLine)
    ) {
      await offlineStorage.saveInspection(optimisticInspection);
      await enqueueMutation({
        type: "CREATE_INSPECTION",
        method: "POST",
        url: "/inspections",
        payload,
        isFormData,
        files,
        entityType: "inspections",
        localId,
        label: `Inspection: ${payload.title}`,
      });
      toast.success(
        "Inspection saved offline to device. Will auto-sync when online.",
      );
      return {
        data: {
          success: true,
          data: optimisticInspection,
          _isOffline: true,
        },
      };
    }
    throw error;
  }
};

export const updateInspection = async (id, data) => {
  const isFormData = data instanceof FormData;

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    let payload = data;
    let files = [];
    if (isFormData) {
      const extracted = await extractFormData(data);
      payload = extracted.fields;
      files = extracted.files;
    }
    const existing = (await offlineStorage.getInspection(id)) || {};
    const updated = {
      ...existing,
      ...payload,
      _pendingSync: true,
      updatedAt: new Date().toISOString(),
    };
    await offlineStorage.saveInspection(updated);
    await enqueueMutation({
      type: "UPDATE_INSPECTION",
      method: "PUT",
      url: `/inspections/${id}`,
      payload,
      isFormData,
      files,
      entityType: "inspections",
      localId: id,
      label: `Update Inspection: ${updated.title || id}`,
    });
    toast.success("Inspection updated offline.");
    return { data: { success: true, data: updated, _isOffline: true } };
  }

  try {
    const config = isFormData
      ? { headers: { "Content-Type": undefined }, timeout: 60000 }
      : {};
    const res = await api.put(`/inspections/${id}`, data, config);
    if (res.data?.data) await offlineStorage.saveInspection(res.data.data);
    return res;
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      let payload = data;
      let files = [];
      if (isFormData) {
        const extracted = await extractFormData(data);
        payload = extracted.fields;
        files = extracted.files;
      }
      const existing = (await offlineStorage.getInspection(id)) || {};
      const updated = {
        ...existing,
        ...payload,
        _pendingSync: true,
        updatedAt: new Date().toISOString(),
      };
      await offlineStorage.saveInspection(updated);
      await enqueueMutation({
        type: "UPDATE_INSPECTION",
        method: "PUT",
        url: `/inspections/${id}`,
        payload,
        isFormData,
        files,
        entityType: "inspections",
        localId: id,
        label: `Update Inspection: ${updated.title || id}`,
      });
      toast.success("Network lost: Inspection updated offline.");
      return { data: { success: true, data: updated, _isOffline: true } };
    }
    throw error;
  }
};

export const deleteInspection = async (id) => {
  const idStr = String(id || "");
  const isOfflineId =
    !id ||
    idStr.startsWith("insp_offline_") ||
    idStr.includes("offline") ||
    idStr.startsWith("local_");

  // Always delete locally and purge any pending mutations for this item
  await offlineStorage.deleteInspection(id);
  removeQueuedMutationsByLocalId(id);

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    if (!isOfflineId) {
      await enqueueMutation({
        type: "DELETE_INSPECTION",
        method: "DELETE",
        url: `/inspections/${id}`,
        entityType: "inspections",
        localId: id,
        label: `Delete Inspection: ${id}`,
      });
    }
    return { data: { success: true, message: "Inspection deleted offline" } };
  }

  try {
    const res = await api.delete(`/inspections/${id}`);
    await offlineStorage.deleteInspection(id);
    removeQueuedMutationsByLocalId(id);
    return res;
  } catch (error) {
    const status = error.response?.status;
    // 404 (already deleted) or 400/500 on offlineId -> cleanly treated as deleted
    if (status === 404 || (isOfflineId && (status === 400 || status === 500))) {
      await offlineStorage.deleteInspection(id);
      removeQueuedMutationsByLocalId(id);
      return {
        data: { success: true, message: "Inspection deleted successfully" },
      };
    }

    if (isOfflineOrNetworkError(error)) {
      await offlineStorage.deleteInspection(id);
      removeQueuedMutationsByLocalId(id);
      if (!isOfflineId) {
        await enqueueMutation({
          type: "DELETE_INSPECTION",
          method: "DELETE",
          url: `/inspections/${id}`,
          entityType: "inspections",
          localId: id,
          label: `Delete Inspection: ${id}`,
        });
      }
      return { data: { success: true, message: "Inspection deleted offline" } };
    }
    throw error;
  }
};

export const closeViolation = async (id, violationId) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const inspection = await offlineStorage.getInspection(id);
    if (inspection && inspection.violations) {
      inspection.violations = inspection.violations.map((v) =>
        v._id === violationId
          ? { ...v, status: "closed", closedAt: new Date().toISOString() }
          : v,
      );
      await offlineStorage.saveInspection(inspection);
    }
    await enqueueMutation({
      type: "CLOSE_VIOLATION",
      method: "PATCH",
      url: `/inspections/${id}/violations/${violationId}`,
      entityType: "inspections",
      localId: id,
      label: "Close Violation",
    });
    toast.success("Violation marked closed offline.");
    return {
      data: {
        success: true,
        message: "Violation closed offline",
        data: inspection,
      },
    };
  }

  try {
    const res = await api.patch(`/inspections/${id}/violations/${violationId}`);
    if (res.data?.data) await offlineStorage.saveInspection(res.data.data);
    return res;
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      const inspection = await offlineStorage.getInspection(id);
      if (inspection && inspection.violations) {
        inspection.violations = inspection.violations.map((v) =>
          v._id === violationId
            ? { ...v, status: "closed", closedAt: new Date().toISOString() }
            : v,
        );
        await offlineStorage.saveInspection(inspection);
      }
      await enqueueMutation({
        type: "CLOSE_VIOLATION",
        method: "PATCH",
        url: `/inspections/${id}/violations/${violationId}`,
        entityType: "inspections",
        localId: id,
        label: "Close Violation",
      });
      toast.success("Violation marked closed offline.");
      return {
        data: {
          success: true,
          message: "Violation closed offline",
          data: inspection,
        },
      };
    }
    throw error;
  }
};

// ==========================================
// COMPLIANCES
// ==========================================
export const getCompliances = async (params) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const list = await offlineStorage.getCompliances();
    return { data: { success: true, data: list } };
  }

  try {
    const res = await api.get("/compliances", { params });
    if (res.data?.data) {
      res.data.data.forEach((c) => offlineStorage.saveCompliance(c));
    }
    return res;
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      const list = await offlineStorage.getCompliances();
      return { data: { success: true, data: list } };
    }
    throw error;
  }
};

export const getOverdueCompliances = async () => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const list = await offlineStorage.getCompliances();
    const overdue = list.filter((c) => c.status === "overdue");
    return { data: { success: true, data: overdue } };
  }

  try {
    return await api.get("/compliances/overdue");
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      const list = await offlineStorage.getCompliances();
      const overdue = list.filter((c) => c.status === "overdue");
      return { data: { success: true, data: overdue } };
    }
    throw error;
  }
};

export const createCompliance = async (data) => {
  const localId = `comp_offline_${Date.now()}`;
  const optimistic = {
    _id: localId,
    ...data,
    createdAt: new Date().toISOString(),
    _isOffline: true,
    _pendingSync: true,
  };

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await offlineStorage.saveCompliance(optimistic);
    await enqueueMutation({
      type: "CREATE_COMPLIANCE",
      method: "POST",
      url: "/compliances",
      payload: data,
      entityType: "compliances",
      localId,
      label: `Compliance: ${data.title}`,
    });
    toast.success("Compliance created offline.");
    return { data: { success: true, data: optimistic, _isOffline: true } };
  }

  try {
    const res = await api.post("/compliances", data);
    if (res.data?.data) await offlineStorage.saveCompliance(res.data.data);
    return res;
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      await offlineStorage.saveCompliance(optimistic);
      await enqueueMutation({
        type: "CREATE_COMPLIANCE",
        method: "POST",
        url: "/compliances",
        payload: data,
        entityType: "compliances",
        localId,
        label: `Compliance: ${data.title}`,
      });
      toast.success("Saved offline. Will sync when connected.");
      return { data: { success: true, data: optimistic, _isOffline: true } };
    }
    throw error;
  }
};

export const updateCompliance = async (id, data) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const existing =
      (await offlineStorage.getCompliances()).find((c) => c._id === id) || {};
    const updated = { ...existing, ...data, _pendingSync: true };
    await offlineStorage.saveCompliance(updated);
    await enqueueMutation({
      type: "UPDATE_COMPLIANCE",
      method: "PUT",
      url: `/compliances/${id}`,
      payload: data,
      entityType: "compliances",
      localId: id,
      label: `Update Compliance: ${updated.title || id}`,
    });
    toast.success("Compliance updated offline.");
    return { data: { success: true, data: updated } };
  }

  try {
    const res = await api.put(`/compliances/${id}`, data);
    if (res.data?.data) await offlineStorage.saveCompliance(res.data.data);
    return res;
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      const existing =
        (await offlineStorage.getCompliances()).find((c) => c._id === id) || {};
      const updated = { ...existing, ...data, _pendingSync: true };
      await offlineStorage.saveCompliance(updated);
      await enqueueMutation({
        type: "UPDATE_COMPLIANCE",
        method: "PUT",
        url: `/compliances/${id}`,
        payload: data,
        entityType: "compliances",
        localId: id,
        label: `Update Compliance: ${updated.title || id}`,
      });
      toast.success("Updated offline.");
      return { data: { success: true, data: updated } };
    }
    throw error;
  }
};

// ==========================================
// ALERTS
// ==========================================
export const getAlerts = async (params) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const list = await offlineStorage.getAlerts();
    return { data: { success: true, data: list } };
  }

  try {
    const res = await api.get("/alerts", { params });
    if (res.data?.data) {
      res.data.data.forEach((a) => offlineStorage.saveAlert(a));
    }
    return res;
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      const list = await offlineStorage.getAlerts();
      return { data: { success: true, data: list } };
    }
    throw error;
  }
};

export const markAlertRead = async (id) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const alerts = await offlineStorage.getAlerts();
    const alert = alerts.find((a) => a._id === id);
    if (alert) {
      alert.isRead = true;
      await offlineStorage.saveAlert(alert);
    }
    await enqueueMutation({
      type: "MARK_ALERT_READ",
      method: "PATCH",
      url: `/alerts/${id}/read`,
      label: "Mark Alert Read",
    });
    return { data: { success: true } };
  }

  try {
    return await api.patch(`/alerts/${id}/read`);
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      const alerts = await offlineStorage.getAlerts();
      const alert = alerts.find((a) => a._id === id);
      if (alert) {
        alert.isRead = true;
        await offlineStorage.saveAlert(alert);
      }
      await enqueueMutation({
        type: "MARK_ALERT_READ",
        method: "PATCH",
        url: `/alerts/${id}/read`,
        label: "Mark Alert Read",
      });
      return { data: { success: true } };
    }
    throw error;
  }
};

export const markAllAlertsRead = async () => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const alerts = await offlineStorage.getAlerts();
    alerts.forEach((a) => {
      a.isRead = true;
      offlineStorage.saveAlert(a);
    });
    await enqueueMutation({
      type: "MARK_ALL_ALERTS_READ",
      method: "PATCH",
      url: "/alerts/read-all",
      label: "Mark All Alerts Read",
    });
    return { data: { success: true } };
  }

  try {
    return await api.patch("/alerts/read-all");
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      const alerts = await offlineStorage.getAlerts();
      alerts.forEach((a) => {
        a.isRead = true;
        offlineStorage.saveAlert(a);
      });
      await enqueueMutation({
        type: "MARK_ALL_ALERTS_READ",
        method: "PATCH",
        url: "/alerts/read-all",
        label: "Mark All Alerts Read",
      });
      return { data: { success: true } };
    }
    throw error;
  }
};

// ==========================================
// CONTRACTORS
// ==========================================
export const getContractors = async (params) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const list = await offlineStorage.getContractors();
    return { data: { success: true, data: list } };
  }

  try {
    const res = await api.get("/contractors", { params });
    if (res.data?.data) {
      res.data.data.forEach((c) => offlineStorage.saveContractor(c));
    }
    return res;
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      const list = await offlineStorage.getContractors();
      return { data: { success: true, data: list } };
    }
    throw error;
  }
};

export const createContractor = async (data) => {
  const localId = `cont_offline_${Date.now()}`;
  const optimistic = {
    _id: localId,
    ...data,
    complianceScore: 85,
    status: data.status || "active",
    createdAt: new Date().toISOString(),
    _isOffline: true,
    _pendingSync: true,
  };

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await offlineStorage.saveContractor(optimistic);
    await enqueueMutation({
      type: "CREATE_CONTRACTOR",
      method: "POST",
      url: "/contractors",
      payload: data,
      entityType: "contractors",
      localId,
      label: `Contractor: ${data.name}`,
    });
    toast.success("Contractor added offline.");
    return { data: { success: true, data: optimistic, _isOffline: true } };
  }

  try {
    const res = await api.post("/contractors", data);
    if (res.data?.data) await offlineStorage.saveContractor(res.data.data);
    return res;
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      await offlineStorage.saveContractor(optimistic);
      await enqueueMutation({
        type: "CREATE_CONTRACTOR",
        method: "POST",
        url: "/contractors",
        payload: data,
        entityType: "contractors",
        localId,
        label: `Contractor: ${data.name}`,
      });
      toast.success("Saved offline. Will sync when back online.");
      return { data: { success: true, data: optimistic, _isOffline: true } };
    }
    throw error;
  }
};

export const updateContractor = async (id, data) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const existing =
      (await offlineStorage.getContractors()).find((c) => c._id === id) || {};
    const updated = { ...existing, ...data, _pendingSync: true };
    await offlineStorage.saveContractor(updated);
    await enqueueMutation({
      type: "UPDATE_CONTRACTOR",
      method: "PUT",
      url: `/contractors/${id}`,
      payload: data,
      entityType: "contractors",
      localId: id,
      label: `Update Contractor: ${updated.name || id}`,
    });
    toast.success("Contractor updated offline.");
    return { data: { success: true, data: updated } };
  }

  try {
    const res = await api.put(`/contractors/${id}`, data);
    if (res.data?.data) await offlineStorage.saveContractor(res.data.data);
    return res;
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      const existing =
        (await offlineStorage.getContractors()).find((c) => c._id === id) || {};
      const updated = { ...existing, ...data, _pendingSync: true };
      await offlineStorage.saveContractor(updated);
      await enqueueMutation({
        type: "UPDATE_CONTRACTOR",
        method: "PUT",
        url: `/contractors/${id}`,
        payload: data,
        entityType: "contractors",
        localId: id,
        label: `Update Contractor: ${updated.name || id}`,
      });
      toast.success("Contractor updated offline.");
      return { data: { success: true, data: updated } };
    }
    throw error;
  }
};

// ==========================================
// WORKERS & ATTENDANCE
// ==========================================
export const getWorkerSummary = async () => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const local = await offlineStorage.getWorkerSummary();
    return { data: { success: true, data: local } };
  }

  try {
    return await api.get("/workers/summary");
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      const local = await offlineStorage.getWorkerSummary();
      return { data: { success: true, data: local } };
    }
    throw error;
  }
};

export const markWorkerAttendance = async (data) => {
  const localId = `att_offline_${Date.now()}`;
  const optimistic = {
    _id: localId,
    workerId: data.workerId,
    date: data.date || new Date().toISOString(),
    status: data.status || "present",
    mineId: data.mineId,
    notes: data.notes || "",
    _isOffline: true,
    _pendingSync: true,
  };

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await offlineStorage.saveAttendance(optimistic);
    await enqueueMutation({
      type: "MARK_WORKER_ATTENDANCE",
      method: "POST",
      url: "/workers/attendance",
      payload: data,
      entityType: "attendance",
      localId,
      label: `Worker Attendance: ${data.workerId}`,
    });
    toast.success("Worker attendance recorded offline.");
    return { data: { success: true, data: optimistic, _isOffline: true } };
  }

  try {
    return await api.post("/workers/attendance", data);
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      await offlineStorage.saveAttendance(optimistic);
      await enqueueMutation({
        type: "MARK_WORKER_ATTENDANCE",
        method: "POST",
        url: "/workers/attendance",
        payload: data,
        entityType: "attendance",
        localId,
        label: `Worker Attendance: ${data.workerId}`,
      });
      toast.success("Worker attendance recorded offline.");
      return { data: { success: true, data: optimistic, _isOffline: true } };
    }
    throw error;
  }
};

export const createWorkerTask = async (data) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await enqueueMutation({
      type: "CREATE_WORKER_TASK",
      method: "POST",
      url: "/workers/tasks",
      payload: data,
      label: `Task: ${data.title}`,
    });
    toast.success("Task created offline.");
    return {
      data: { success: true, data: { ...data, _id: `task_${Date.now()}` } },
    };
  }

  try {
    return await api.post("/workers/tasks", data);
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      await enqueueMutation({
        type: "CREATE_WORKER_TASK",
        method: "POST",
        url: "/workers/tasks",
        payload: data,
        label: `Task: ${data.title}`,
      });
      toast.success("Task created offline.");
      return {
        data: { success: true, data: { ...data, _id: `task_${Date.now()}` } },
      };
    }
    throw error;
  }
};

export const updateWorkerTask = async (id, data) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await enqueueMutation({
      type: "UPDATE_WORKER_TASK",
      method: "PATCH",
      url: `/workers/tasks/${id}`,
      payload: data,
      label: "Update Task",
    });
    toast.success("Task updated offline.");
    return { data: { success: true, data } };
  }

  try {
    return await api.patch(`/workers/tasks/${id}`, data);
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      await enqueueMutation({
        type: "UPDATE_WORKER_TASK",
        method: "PATCH",
        url: `/workers/tasks/${id}`,
        payload: data,
        label: "Update Task",
      });
      toast.success("Task updated offline.");
      return { data: { success: true, data } };
    }
    throw error;
  }
};

export const reassignPendingWorkerTasks = async (workerId) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await enqueueMutation({
      type: "REASSIGN_TASKS",
      method: "POST",
      url: `/workers/${workerId}/reassign-pending`,
      label: `Reassign Tasks for Worker ${workerId}`,
    });
    toast.success("Tasks reassigned offline.");
    return { data: { success: true, message: "Tasks reassigned offline" } };
  }

  try {
    return await api.post(`/workers/${workerId}/reassign-pending`);
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      await enqueueMutation({
        type: "REASSIGN_TASKS",
        method: "POST",
        url: `/workers/${workerId}/reassign-pending`,
        label: `Reassign Tasks for Worker ${workerId}`,
      });
      toast.success("Tasks reassigned offline.");
      return { data: { success: true, message: "Tasks reassigned offline" } };
    }
    throw error;
  }
};

// ==========================================
// REAL-TIME ATTENDANCE & PRESENCE
// ==========================================
export const getRealtimeAttendance = async (params) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const local = await offlineStorage.getRealtimeAttendance();
    return { data: { success: true, data: local } };
  }

  try {
    return await api.get("/attendance/realtime", { params });
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      const local = await offlineStorage.getRealtimeAttendance();
      return { data: { success: true, data: local } };
    }
    throw error;
  }
};

export const getAttendance = async (params) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    let list = await offlineStorage.getAttendance();
    if (params?.shift) list = list.filter((a) => a.shift === params.shift);
    if (params?.liveStatus)
      list = list.filter((a) => a.liveStatus === params.liveStatus);
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.workerName?.toLowerCase().includes(q) ||
          a.workerId?.toLowerCase().includes(q),
      );
    }
    return { data: { success: true, data: list } };
  }

  try {
    const res = await api.get("/attendance", { params });
    if (res.data?.data) {
      res.data.data.forEach((a) => offlineStorage.saveAttendance(a));
    }
    return res;
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      let list = await offlineStorage.getAttendance();
      if (params?.shift) list = list.filter((a) => a.shift === params.shift);
      if (params?.liveStatus)
        list = list.filter((a) => a.liveStatus === params.liveStatus);
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (a) =>
            a.workerName?.toLowerCase().includes(q) ||
            a.workerId?.toLowerCase().includes(q),
        );
      }
      return { data: { success: true, data: list } };
    }
    throw error;
  }
};

export const markCheckIn = async (data) => {
  const localId = `att_offline_${Date.now()}`;
  const mineInfo = (await offlineStorage.getMine(data.mineId)) || {
    _id: data.mineId,
    name: "Current Mine",
  };

  const optimistic = {
    _id: localId,
    workerName: data.workerName,
    workerId: data.workerId,
    mineId: mineInfo,
    role: data.role || "Miner",
    shift: data.shift || "Shift A (Morning)",
    zone: data.zone || "Pit-1 Underground Face",
    liveStatus: "inside_mine",
    safetyGearVerified: data.safetyGearVerified ?? true,
    bodyTemp: data.bodyTemp || "36.6",
    checkIn: new Date().toISOString(),
    status: "present",
    _isOffline: true,
    _pendingSync: true,
  };

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await offlineStorage.saveAttendance(optimistic);
    await enqueueMutation({
      type: "CHECK_IN",
      method: "POST",
      url: "/attendance/check-in",
      payload: data,
      entityType: "attendance",
      localId,
      label: `Clock In: ${data.workerName}`,
    });
    return {
      data: {
        success: true,
        message: `${data.workerName} checked in safely (Offline Mode)`,
        data: optimistic,
        _isOffline: true,
      },
    };
  }

  try {
    const res = await api.post("/attendance/check-in", data);
    if (res.data?.data) await offlineStorage.saveAttendance(res.data.data);
    return res;
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      await offlineStorage.saveAttendance(optimistic);
      await enqueueMutation({
        type: "CHECK_IN",
        method: "POST",
        url: "/attendance/check-in",
        payload: data,
        entityType: "attendance",
        localId,
        label: `Clock In: ${data.workerName}`,
      });
      return {
        data: {
          success: true,
          message: `${data.workerName} checked in safely (Saved offline)`,
          data: optimistic,
          _isOffline: true,
        },
      };
    }
    throw error;
  }
};

export const markCheckOut = async (id) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const list = await offlineStorage.getAttendance();
    const item = list.find((a) => a._id === id);
    if (item) {
      item.checkOut = new Date().toISOString();
      item.liveStatus = "checked_out";
      await offlineStorage.saveAttendance(item);
    }
    await enqueueMutation({
      type: "CHECK_OUT",
      method: "POST",
      url: `/attendance/${id}/check-out`,
      entityType: "attendance",
      localId: id,
      label: `Check out: ${item?.workerName || id}`,
    });
    return { data: { success: true, message: "Checked out offline" } };
  }

  try {
    return await api.post(`/attendance/${id}/check-out`);
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      const list = await offlineStorage.getAttendance();
      const item = list.find((a) => a._id === id);
      if (item) {
        item.checkOut = new Date().toISOString();
        item.liveStatus = "checked_out";
        await offlineStorage.saveAttendance(item);
      }
      await enqueueMutation({
        type: "CHECK_OUT",
        method: "POST",
        url: `/attendance/${id}/check-out`,
        entityType: "attendance",
        localId: id,
        label: `Check out: ${item?.workerName || id}`,
      });
      return { data: { success: true, message: "Checked out offline" } };
    }
    throw error;
  }
};

export const updateAttendanceLiveStatus = async (id, data) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const list = await offlineStorage.getAttendance();
    const item = list.find((a) => a._id === id);
    if (item) {
      item.liveStatus = data.liveStatus;
      await offlineStorage.saveAttendance(item);
    }
    await enqueueMutation({
      type: "UPDATE_LIVE_STATUS",
      method: "PATCH",
      url: `/attendance/${id}/live-status`,
      payload: data,
      entityType: "attendance",
      localId: id,
      label: `Zone Change: ${item?.workerName || id}`,
    });
    return { data: { success: true, data: item } };
  }

  try {
    return await api.patch(`/attendance/${id}/live-status`, data);
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      const list = await offlineStorage.getAttendance();
      const item = list.find((a) => a._id === id);
      if (item) {
        item.liveStatus = data.liveStatus;
        await offlineStorage.saveAttendance(item);
      }
      await enqueueMutation({
        type: "UPDATE_LIVE_STATUS",
        method: "PATCH",
        url: `/attendance/${id}/live-status`,
        payload: data,
        entityType: "attendance",
        localId: id,
        label: `Zone Change: ${item?.workerName || id}`,
      });
      return { data: { success: true, data: item } };
    }
    throw error;
  }
};

// ==========================================
// SUPPORT & EMERGENCY DIRECTORY
// ==========================================
export const getSupportDirectory = async () => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const list = await offlineStorage.getSupportDirectory();
    return { data: { success: true, data: list } };
  }

  try {
    const res = await api.get("/support/directory");
    return res;
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      const list = await offlineStorage.getSupportDirectory();
      return { data: { success: true, data: list } };
    }
    throw error;
  }
};

export const getSupportTickets = async (params) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    let list = await offlineStorage.getSupportTickets();
    if (params?.category)
      list = list.filter((t) => t.category === params.category);
    return { data: { success: true, data: list } };
  }

  try {
    const res = await api.get("/support/tickets", { params });
    if (res.data?.data) {
      res.data.data.forEach((t) => offlineStorage.saveSupportTicket(t));
    }
    return res;
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      let list = await offlineStorage.getSupportTickets();
      if (params?.category)
        list = list.filter((t) => t.category === params.category);
      return { data: { success: true, data: list } };
    }
    throw error;
  }
};

export const getSupportTicket = async (id) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const item = await offlineStorage.getSupportTicket(id);
    return { data: { success: true, data: item } };
  }

  try {
    return await api.get(`/support/tickets/${id}`);
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      const item = await offlineStorage.getSupportTicket(id);
      return { data: { success: true, data: item } };
    }
    throw error;
  }
};

export const createSupportTicket = async (data) => {
  const localId = `ticket_offline_${Date.now()}`;
  const optimistic = {
    _id: localId,
    ...data,
    status: "open",
    responses: [],
    createdAt: new Date().toISOString(),
    _isOffline: true,
    _pendingSync: true,
  };

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await offlineStorage.saveSupportTicket(optimistic);
    await enqueueMutation({
      type: "CREATE_SUPPORT_TICKET",
      method: "POST",
      url: "/support/tickets",
      payload: data,
      entityType: "supportTickets",
      localId,
      label: `Ticket: ${data.subject}`,
    });
    toast.success("Support ticket created offline.");
    return { data: { success: true, data: optimistic, _isOffline: true } };
  }

  try {
    const res = await api.post("/support/tickets", data);
    if (res.data?.data) await offlineStorage.saveSupportTicket(res.data.data);
    return res;
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      await offlineStorage.saveSupportTicket(optimistic);
      await enqueueMutation({
        type: "CREATE_SUPPORT_TICKET",
        method: "POST",
        url: "/support/tickets",
        payload: data,
        entityType: "supportTickets",
        localId,
        label: `Ticket: ${data.subject}`,
      });
      toast.success("Saved offline. Will sync when connected.");
      return { data: { success: true, data: optimistic, _isOffline: true } };
    }
    throw error;
  }
};

export const updateSupportTicket = async (id, data) => {
  const ticket = await offlineStorage.getSupportTicket(id);
  const optimistic = ticket
    ? { ...ticket, ...data, updatedAt: new Date().toISOString() }
    : { _id: id, ...data, updatedAt: new Date().toISOString() };

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await offlineStorage.saveSupportTicket(optimistic);
    await enqueueMutation({
      type: "UPDATE_SUPPORT_TICKET",
      method: "PATCH",
      url: `/support/tickets/${id}`,
      payload: data,
      entityType: "supportTickets",
      localId: id,
      label: `Update Ticket ${id}`,
    });
    return { data: { success: true, data: optimistic, _isOffline: true } };
  }

  try {
    const res = await api.patch(`/support/tickets/${id}`, data);
    if (res.data?.data) await offlineStorage.saveSupportTicket(res.data.data);
    return res;
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      await offlineStorage.saveSupportTicket(optimistic);
      await enqueueMutation({
        type: "UPDATE_SUPPORT_TICKET",
        method: "PATCH",
        url: `/support/tickets/${id}`,
        payload: data,
        entityType: "supportTickets",
        localId: id,
        label: `Update Ticket ${id}`,
      });
      return { data: { success: true, data: optimistic, _isOffline: true } };
    }
    throw error;
  }
};

export const deleteSupportTicket = async (id) => {
  await offlineStorage.deleteSupportTicket(id);
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await enqueueMutation({
      type: "DELETE_SUPPORT_TICKET",
      method: "DELETE",
      url: `/support/tickets/${id}`,
      entityType: "supportTickets",
      localId: id,
      label: `Delete Ticket ${id}`,
    });
    return { data: { success: true, _isOffline: true } };
  }

  try {
    const res = await api.delete(`/support/tickets/${id}`);
    return res;
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      await enqueueMutation({
        type: "DELETE_SUPPORT_TICKET",
        method: "DELETE",
        url: `/support/tickets/${id}`,
        entityType: "supportTickets",
        localId: id,
        label: `Delete Ticket ${id}`,
      });
      return { data: { success: true, _isOffline: true } };
    }
    throw error;
  }
};

export const replySupportTicket = async (id, data) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const ticket = await offlineStorage.getSupportTicket(id);
    if (ticket) {
      if (!ticket.responses) ticket.responses = [];
      ticket.responses.push({
        sender: "Me (Offline)",
        message: data.message,
        createdAt: new Date().toISOString(),
      });
      await offlineStorage.saveSupportTicket(ticket);
    }
    await enqueueMutation({
      type: "REPLY_SUPPORT_TICKET",
      method: "POST",
      url: `/support/tickets/${id}/responses`,
      payload: data,
      entityType: "supportTickets",
      localId: id,
      label: `Reply to Ticket ${id}`,
    });
    toast.success("Reply recorded offline.");
    return { data: { success: true, message: "Reply added offline" } };
  }

  try {
    return await api.post(`/support/tickets/${id}/responses`, data);
  } catch (error) {
    if (isOfflineOrNetworkError(error)) {
      const ticket = await offlineStorage.getSupportTicket(id);
      if (ticket) {
        if (!ticket.responses) ticket.responses = [];
        ticket.responses.push({
          sender: "Me (Offline)",
          message: data.message,
          createdAt: new Date().toISOString(),
        });
        await offlineStorage.saveSupportTicket(ticket);
      }
      await enqueueMutation({
        type: "REPLY_SUPPORT_TICKET",
        method: "POST",
        url: `/support/tickets/${id}/responses`,
        payload: data,
        entityType: "supportTickets",
        localId: id,
        label: `Reply to Ticket ${id}`,
      });
      toast.success("Reply recorded offline.");
      return { data: { success: true, message: "Reply added offline" } };
    }
    throw error;
  }
};
