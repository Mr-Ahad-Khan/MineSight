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
  }, []);

  useEffect(() => {
    let timeoutId;
    const enhanceControls = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        document.querySelectorAll("button").forEach((button) => {
          if (button.title) return;

          const label =
            button.getAttribute("aria-label") ||
            button.textContent?.replace(/\s+/g, " ").trim() ||
            "Button";
          button.setAttribute("title", label);
        });
      }, 400);
    };

    enhanceControls();
    const observer = new MutationObserver(enhanceControls);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
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
        fallback={
          <main
            className="min-h-screen bg-slate-50 dark:bg-slate-950"
            aria-label="Loading page"
          />
        }
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
