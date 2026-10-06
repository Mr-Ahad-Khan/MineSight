import { lazy, Suspense, useEffect, useState, useRef } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  WifiOff,
  RefreshCw,
  AlertTriangle,
  LogIn,
  LogOut,
  X,
} from "lucide-react";
import { App as CapApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import toast from "react-hot-toast";
import useAuthStore from "./store/authStore";
import useThemeStore, { useLanguageStore } from "./store/themeStore";
import { translations } from "./i18n/translations";
import { triggerSyncNow, getPendingSyncCount } from "./services/api";
import { isTokenExpired } from "./utils/authUtils";
import {
  initNetworkManager,
  subscribeNetworkStatus,
  getNetworkStatus,
} from "./services/networkManager";

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

// Preload auth and core inspection form pages so single-click navigation is instantaneous even offline
if (typeof window !== "undefined") {
  const preloadCriticalPages = () => {
    import("./pages/Login");
    import("./pages/Register");
    import("./pages/CreateInspection");
    import("./pages/Inspections");
  };
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(preloadCriticalPages);
  } else {
    setTimeout(preloadCriticalPages, 120);
  }
}
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Inspections = lazy(() => import("./pages/Inspections"));
const CreateInspection = lazy(() => import("./pages/CreateInspection"));
const InspectionDetail = lazy(() => import("./pages/InspectionDetail"));
const Compliances = lazy(() => import("./pages/Compliances"));
const Mines = lazy(() => import("./pages/Mines"));
const MineralResourcesDashboard = lazy(
  () => import("./pages/MineralResourcesDashboard"),
);
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
  return <Dashboard />;
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
  const { language } = useLanguageStore();
  const t = translations[language] || translations.en;
  const navigate = useNavigate();
  const location = useLocation();
  const [isOffline, setIsOffline] = useState(() => !getNetworkStatus());
  const [offlineBannerDismissed, setOfflineBannerDismissed] = useState(false);
  const [pendingCount, setPendingCount] = useState(getPendingSyncCount());
  const [sessionExpired, setSessionExpired] = useState(() => {
    const token = localStorage.getItem("token");
    return Boolean(token && isTokenExpired(token));
  });

  const isPublicRoute =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password";
  const shouldShowExpiredBanner = Boolean(
    sessionExpired &&
    !isPublicRoute &&
    localStorage.getItem("token") &&
    location.pathname.startsWith("/app"),
  );
  const showOfflineBanner = isOffline && !offlineBannerDismissed;

  useEffect(() => {
    if (!isOffline) {
      setOfflineBannerDismissed(false);
    }
  }, [isOffline]);

  useEffect(() => {
    initNetworkManager();

    const unsubNetwork = subscribeNetworkStatus((online) => {
      setIsOffline(!online);
    });

    const handleCustomNetwork = (e) => {
      if (typeof e.detail?.isOnline === "boolean") {
        setIsOffline(!e.detail.isOnline);
      }
    };

    const handleQueueChange = (e) => {
      setPendingCount(e.detail?.pendingCount ?? getPendingSyncCount());
    };

    window.addEventListener("minesight:network-status", handleCustomNetwork);
    window.addEventListener("minesight:queue-updated", handleQueueChange);

    return () => {
      unsubNetwork();
      window.removeEventListener(
        "minesight:network-status",
        handleCustomNetwork,
      );
      window.removeEventListener("minesight:queue-updated", handleQueueChange);
    };
  }, []);

  useEffect(() => {
    const handleTokenExpired = () => {
      if (localStorage.getItem("token")) {
        setSessionExpired(true);
      }
    };

    const handleAuthLogout = () => {
      setSessionExpired(false);
    };

    window.addEventListener("minesight:token-expired", handleTokenExpired);
    window.addEventListener("minesight:auth-logout", handleAuthLogout);

    const interval = setInterval(() => {
      const currentToken = localStorage.getItem("token");
      if (currentToken && isTokenExpired(currentToken)) {
        setSessionExpired(true);
      } else if (!currentToken) {
        setSessionExpired(false);
      }
    }, 5000);

    return () => {
      window.removeEventListener("minesight:token-expired", handleTokenExpired);
      window.removeEventListener("minesight:auth-logout", handleAuthLogout);
      clearInterval(interval);
    };
  }, []);

  const lastBackPressRef = useRef(0);

  // Handle Android mobile hardware back button
  useEffect(() => {
    const isNative =
      Capacitor.isNativePlatform() ||
      (typeof window !== "undefined" &&
        (Boolean(window.Capacitor?.isNativePlatform?.()) ||
          window.location.protocol === "capacitor:" ||
          window.location.protocol === "ionic:"));

    if (!isNative) return;

    let removeListener = null;

    const setupBackListener = async () => {
      try {
        const handler = await CapApp.addListener("backButton", () => {
          // 1. Dispatch custom event allowing modals, sidebars, or viewers to intercept
          const backEvent = new CustomEvent("minesight:back-button", {
            cancelable: true,
          });
          const cancelled = !window.dispatchEvent(backEvent);
          if (cancelled) return;

          // 2. Dismiss any active modal/drawer with standard close buttons
          const openModalCloseBtn = document.querySelector(
            "[data-modal-open='true'] button[aria-label='Close'], [role='dialog'] button[aria-label='Close'], [role='dialog'] button[aria-label='close'], .modal-active button[aria-label='Close']",
          );
          if (openModalCloseBtn) {
            openModalCloseBtn.click();
            return;
          }

          // 3. Navigate backwards if not on top-level root
          const pathname = window.location.pathname;
          const isRootPath =
            pathname === "/app" || pathname === "/" || pathname === "/login";
          const historyIdx = window.history.state?.idx ?? 0;

          if (!isRootPath) {
            if (historyIdx > 0) {
              navigate(-1);
            } else {
              const token = localStorage.getItem("token");
              navigate(token ? "/app" : "/");
            }
          } else {
            // If on root route, check if history allows navigating back (e.g. was on /app, navigated to /login)
            if (historyIdx > 0 && pathname !== "/app") {
              navigate(-1);
            } else {
              const now = Date.now();
              if (now - lastBackPressRef.current < 2000) {
                CapApp.exitApp();
              } else {
                lastBackPressRef.current = now;
                toast("Press back again to exit", {
                  id: "mobile-exit-app",
                  duration: 2000,
                });
              }
            }
          }
        });

        removeListener = () => handler.remove();
      } catch (err) {
        console.warn("Capacitor backButton setup:", err);
      }
    };

    setupBackListener();

    return () => {
      if (removeListener) removeListener();
    };
  }, [navigate]);

  const handleReLogin = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setSessionExpired(false);
    useAuthStore.getState().logout();
    navigate("/login", { state: { message: t.sessionExpiredDescription } });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setSessionExpired(false);
    useAuthStore.getState().logout();
    navigate("/login");
  };

  useEffect(() => {
    initTheme();

    const handlePreloadError = () => {
      window.location.reload();
    };
    window.addEventListener("vite:preloadError", handlePreloadError);
    return () =>
      window.removeEventListener("vite:preloadError", handlePreloadError);
  }, []);

  const bannerRef = useRef(null);
  const [bannerHeight, setBannerHeight] = useState(() =>
    typeof navigator !== "undefined" && !navigator.onLine ? 36 : 0,
  );

  useEffect(() => {
    if (
      !shouldShowExpiredBanner &&
      !showOfflineBanner &&
      (!isOffline || pendingCount === 0)
    ) {
      setBannerHeight(0);
      document.documentElement.style.setProperty(
        "--status-banner-height",
        "0px",
      );
      return;
    }

    const updateHeight = () => {
      const h = bannerRef.current
        ? bannerRef.current.offsetHeight
        : shouldShowExpiredBanner
          ? 48
          : showOfflineBanner
            ? 40
            : 0;
      setBannerHeight(h);
      document.documentElement.style.setProperty(
        "--status-banner-height",
        `${h}px`,
      );
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
  }, [shouldShowExpiredBanner, showOfflineBanner, isOffline, pendingCount]);

  return (
    <div style={{ "--status-banner-height": `${bannerHeight}px` }}>
      {shouldShowExpiredBanner ? (
        <aside
          ref={bannerRef}
          aria-label="Session token expired alert"
          className="session-expired-banner fixed inset-x-0 top-0 z-[60] flex flex-wrap items-center justify-between gap-3 border-b-2 border-red-500 bg-[#fff1f2] px-4 py-2.5 text-red-950 shadow-md backdrop-blur-md dark:border-red-600 dark:bg-[#280c12] dark:text-red-100 sm:px-6"
          role="alert"
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300">
              <AlertTriangle className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <div className="leading-snug">
              <strong className="font-extrabold text-red-800 dark:text-red-300">
                {t.sessionTokenExpired}
              </strong>{" "}
              <span>{t.sessionExpiredDescription}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleReLogin}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-red-700 active:scale-95 transition"
            >
              <LogIn className="h-3.5 w-3.5" />
              {t.logInAgain}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-bold text-red-900 hover:bg-red-50 dark:border-red-800 dark:bg-red-950/80 dark:text-red-200 dark:hover:bg-red-900 active:scale-95 transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              {t.logout}
            </button>
          </div>
        </aside>
      ) : showOfflineBanner ? (
        <aside
          ref={bannerRef}
          aria-label="Offline status"
          className="offline-status-banner fixed inset-x-0 top-0 z-[70] flex flex-wrap items-center justify-center gap-2 border-b border-amber-500/50 bg-amber-500/20 px-4 py-2 text-center text-xs font-semibold text-amber-950 shadow-md backdrop-blur-md dark:border-amber-600/80 dark:bg-amber-950/95 dark:text-amber-100 sm:text-sm"
          role="status"
        >
          <WifiOff
            className="h-4 w-4 shrink-0 text-[#78350f] dark:text-amber-300"
            strokeWidth={2.25}
            aria-hidden="true"
          />
          <span>
            <strong className="font-bold">{t.offlineModeActive}</strong>{" "}
            {t.offlineModeDescription}
          </span>
          {pendingCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-amber-500/30 px-2.5 py-0.5 text-xs font-black text-amber-950 dark:text-amber-200">
              {pendingCount}{" "}
              {pendingCount > 1 ? t.pendingSyncPlural : t.pendingSync}
            </span>
          )}
          <button
            type="button"
            onClick={() => setOfflineBannerDismissed(true)}
            className="rounded-md p-1 text-amber-900 transition hover:bg-amber-500/30 dark:text-amber-200"
            aria-label={t.dismissOfflineBanner}
            title={t.dismissOfflineBanner}
          >
            <X className="h-4 w-4" />
          </button>
        </aside>
      ) : !isOffline && pendingCount > 0 ? (
        <aside
          ref={bannerRef}
          aria-label="Pending sync status"
          className="pending-status-banner fixed inset-x-0 top-0 z-[70] flex items-center justify-center gap-2 border-b border-sky-400/50 bg-sky-500/20 px-4 py-2 text-center text-xs font-semibold text-sky-950 shadow-md backdrop-blur-md dark:border-sky-700/80 dark:bg-sky-950/95 dark:text-sky-100 sm:text-sm"
          role="status"
        >
          <RefreshCw
            className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400"
            aria-hidden="true"
          />
          <span>
            {language === "hi" ? "आप ऑनलाइन हैं और " : "You are online with "}
            {pendingCount}{" "}
            {pendingCount > 1 ? t.onlineOfflineUpdates : t.onlineOfflineUpdate}{" "}
            {t.queued}
          </span>
          <button
            type="button"
            onClick={() => triggerSyncNow()}
            className="ml-2 rounded-md bg-sky-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm hover:bg-sky-700 transition"
          >
            {t.syncNow}
          </button>
        </aside>
      ) : null}
      <Suspense fallback={<AppLoadingSkeleton />}>
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
            <Route
              path="mineral-resources"
              element={<MineralResourcesDashboard />}
            />
            <Route path="contractors" element={<Contractors />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="support" element={<Support />} />
            <Route
              path="disaster-management"
              element={<DisasterManagement />}
            />
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
