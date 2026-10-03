import { lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { WifiOff } from "lucide-react";
import useAuthStore from "./store/authStore";
import useThemeStore from "./store/themeStore";

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

  useEffect(() => {
    const updateConnection = () => setIsOffline(!navigator.onLine);

    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    return () => {
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
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



  return (
    <>
      {isOffline && (
        <div
          className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-center text-xs font-semibold text-amber-950 shadow-sm dark:bg-amber-950 dark:text-amber-100 sm:text-sm"
          role="status"
        >
          <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            You are offline. Cached screens are available; live data and changes need a connection.
          </span>
        </div>
      )}
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
    </>
  );
}

export default App;
