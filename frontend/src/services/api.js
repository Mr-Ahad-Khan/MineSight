import axios from "axios";

// 1. Resolve and sanitize the base URL to prevent double slashes or broken paths
const rawBackendUrl =
  import.meta.env.VITE_BACKEND_URI || import.meta.env.VITE_API_URL;

// Strip trailing slashes and normalize the endpoint
let apiBaseUrl = "";

if (rawBackendUrl) {
  const cleanUrl = rawBackendUrl.replace(/\/+$/, "");
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

// Request interceptor - add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;

// Auth
export const login = (data) => api.post("/auth/login", data);
export const register = (data) => api.post("/auth/register", data);
export const getMe = () => api.get("/auth/me");

// Dashboard
export const getDashboardSummary = () => api.get("/dashboard/summary");
export const getAnalytics = () => api.get("/dashboard/analytics");

// Mines
export const getMines = (params) => api.get("/mines", { params });
export const getMine = (id) => api.get(`/mines/${id}`);
export const createMine = (data) => api.post("/mines", data);
export const updateMine = (id, data) => api.put(`/mines/${id}`, data);

// Inspections
export const getInspections = (params) => api.get("/inspections", { params });
export const getInspection = (id) => api.get(`/inspections/${id}`);
export const createInspection = (data) => api.post("/inspections", data);
export const updateInspection = (id, data) =>
  api.put(`/inspections/${id}`, data);
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
