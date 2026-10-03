import { lazy, Suspense, useEffect, useState, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { WifiOff, RefreshCw } from "lucide-react";
import useAuthStore from "./store/authStore";
import useThemeStore from "./store/themeStore";
import { triggerSyncNow, getPendingSyncCount } from "./services/api";

function PublicHomeRoute() {
  const { token } = useAuthStore();
  return token ? <Navigate to="/app" replace /> : <HomePage />;
}

// Keep each screen out of the initial bundle. This is especially important for
// the map and analytics screens, which bring in large third-party libraries.
const Layout = lazy(() => import("./components/layout/Layout"));
const HomePage = lazy(() => import("./pages/HomePage"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

// Preload auth pages in idle time so reCAPTCHA wrapper chunk is immediately ready
if (typeof window !== "undefined") {
  const preloadAuth = () => {
    import("./pages/Login");
    import("./pages/Register");
  };
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(preloadAuth);
  } else {
    setTimeout(preloadAuth, 120);
  }
}
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Inspections = lazy(() => import("./pages/Inspections"));
const CreateInspection = lazy(() => import("./pages/CreateInspection"));
const InspectionDetail = lazy(() => import("./pages/InspectionDetail"));
const Compliances = lazy(() => import("./pages/Compliances"));
const Mines = lazy(() => import("./pages/Mines"));
const MineralResourcesDashboard = lazy(() => import("./pages/MineralResourcesDashboard"));
const Contractors = lazy(() => import("./pages/Contractors"));
const Alerts = lazy(() => import("./pages/Alerts"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Chat = lazy(() => import("./pages/Chat"));
const Profile = lazy(() => import("./pages/Profile"));
const Workers = lazy(() => import("./pages/Workers"));
const Attendance = lazy(() => import("./pages/Attendance"));
const Support = lazy(() => import("./pages/Support"));
const DisasterManagement = lazy(() => import("./pages/DisasterManagement"));

function PrivateRoute({ children }) {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
}

function AppIndex() {
  const { user } = useAuthStore();
  return user?.role === "worker" ? <Workers /> : <Dashboard />;
}

function AppLoadingSkeleton() {
  return (
    <main
      className="min-h-screen bg-[#f5f7fa] px-4 py-5 dark:bg-[#0f1720] sm:px-6 lg:px-8"
      aria-label="Loading page"
      role="status"
    >
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="flex h-12 items-center justify-between border-b border-slate-200 dark:border-slate-700">
          <div className="h-7 w-36 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="hidden items-center gap-3 md:flex">
            <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="h-9 w-9 rounded bg-slate-200 dark:bg-slate-700 md:hidden" />
        </div>

        <div className="py-10">
          <div className="mb-8 max-w-xl space-y-3">
            <div className="h-3 w-32 rounded bg-amber-200 dark:bg-amber-900/60" />
            <div className="h-9 w-3/4 rounded bg-slate-300 dark:bg-slate-600" />
            <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="mt-5 h-7 w-16 rounded bg-slate-300 dark:bg-slate-600" />
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
            <div className="h-72 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
              <div className="h-5 w-44 rounded bg-slate-300 dark:bg-slate-600" />
              <div className="mt-8 h-40 rounded-lg bg-slate-100 dark:bg-slate-700/70" />
            </div>
            <div className="h-72 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
              <div className="h-5 w-36 rounded bg-slate-300 dark:bg-slate-600" />
              <div className="mt-7 space-y-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div className="h-3 flex-1 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-3 w-12 rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function App() {
  const { initTheme } = useThemeStore();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingCount, setPendingCount] = useState(getPendingSyncCount());

  useEffect(() => {
    const updateConnection = () => setIsOffline(!navigator.onLine);
    const handleQueueChange = (e) => {
      setPendingCount(e.detail?.pendingCount ?? getPendingSyncCount());
    };

    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    window.addEventListener("minesight:queue-updated", handleQueueChange);

    return () => {
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
      window.removeEventListener("minesight:queue-updated", handleQueueChange);
    };
  }, []);

  useEffect(() => {
    initTheme();

    const handlePreloadError = () => {
      window.location.reload();
    };
    window.addEventListener("vite:preloadError", handlePreloadError);
    return () => window.removeEventListener("vite:preloadError", handlePreloadError);
  }, []);

  const bannerRef = useRef(null);
  const [bannerHeight, setBannerHeight] = useState(() => (
    typeof navigator !== "undefined" && !navigator.onLine ? 36 : 0
  ));

  useEffect(() => {
    if (!isOffline && pendingCount === 0) {
      setBannerHeight(0);
      return;
    }

    const updateHeight = () => {
      if (bannerRef.current) {
        setBannerHeight(bannerRef.current.offsetHeight);
      }
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    if (bannerRef.current) {
      observer.observe(bannerRef.current);
    }
    window.addEventListener("resize", updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [isOffline, pendingCount]);

  return (
    <div style={{ "--status-banner-height": `${bannerHeight}px` }}>
      {isOffline ? (
        <aside
          ref={bannerRef}
          aria-label="Offline status"
          className="offline-status-banner fixed inset-x-0 top-0 z-[100] flex flex-wrap items-center justify-center gap-2 border-b border-amber-400/40 bg-amber-500/15 px-4 py-1.5 text-center text-xs font-medium text-amber-950 shadow-sm backdrop-blur-md dark:border-amber-700/60 dark:bg-amber-950/90 dark:text-amber-100 sm:text-sm"
          role="status"
        >
          <WifiOff className="h-4 w-4 shrink-0 text-[#78350f] dark:text-amber-300" strokeWidth={2.25} aria-hidden="true" />
          <span>
            <strong className="font-semibold">Offline Mode Active:</strong> All features, inspections, attendance, and forms work offline. Changes are saved locally and will auto-sync when online.
          </span>
          {pendingCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-amber-500/30 px-2 py-0.5 text-xs font-bold text-amber-900 dark:text-amber-200">
              {pendingCount} change{pendingCount > 1 ? "s" : ""} pending sync
            </span>
          )}
        </aside>
      ) : pendingCount > 0 ? (
        <aside
          ref={bannerRef}
          aria-label="Pending sync status"
          className="pending-status-banner fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-2 border-b border-sky-400/40 bg-sky-500/15 px-4 py-1.5 text-center text-xs font-medium text-sky-950 shadow-sm backdrop-blur-md dark:border-sky-700/60 dark:bg-sky-950/90 dark:text-sky-100 sm:text-sm"
          role="status"
        >
          <RefreshCw className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden="true" />
          <span>You are online with {pendingCount} offline update{pendingCount > 1 ? "s" : ""} queued.</span>
          <button
            type="button"
            onClick={() => triggerSyncNow()}
            className="ml-2 rounded-md bg-sky-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 transition"
          >
            Sync Now
          </button>
        </aside>
      ) : null}
      <Suspense
        fallback={<AppLoadingSkeleton />}
      >
        <Routes>
          <Route path="/" element={<PublicHomeRoute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/app"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<AppIndex />} />
            <Route path="inspections" element={<Inspections />} />
            <Route path="inspections/new" element={<CreateInspection />} />
            <Route path="inspections/:id" element={<InspectionDetail />} />
            <Route path="compliances" element={<Compliances />} />
            <Route path="mines" element={<Mines />} />
            <Route path="mineral-resources" element={<MineralResourcesDashboard />} />
            <Route path="contractors" element={<Contractors />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="support" element={<Support />} />
            <Route path="disaster-management" element={<DisasterManagement />} />
            <Route path="chat" element={<Chat />} />
            <Route path="profile" element={<Profile />} />
            <Route path="workers" element={<Workers />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
