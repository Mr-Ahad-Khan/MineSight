import { lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { CloudUpload, WifiOff } from "lucide-react";
import useAuthStore from "./store/authStore";
import useThemeStore from "./store/themeStore";
import { useLanguageStore } from "./store/themeStore";
import i18n from "./i18n/config";
import { languageOptions, localTextTranslations, translations } from "./i18n/translations";
import { syncOfflineMutations } from "./services/api";
import { countOfflineMutations, getOfflineCacheScope } from "./services/offlineCache";

const translatedNodes = new WeakMap();
const translatedAttributes = new WeakMap();
const sourcePhrasesByTranslation = new Map(
  languageOptions.map(({ code }) => {
    const phrases = new Map();
    Object.entries(translations[code] || {}).forEach(([source, translated]) => {
      if (translated && !phrases.has(translated)) phrases.set(translated, source);
    });
    Object.entries(localTextTranslations[code] || {}).forEach(([source, translated]) => {
      if (translated) phrases.set(translated, source);
    });
    return [code, phrases];
  }),
);

function getSourcePhrase(value, previous) {
  if (previous?.translated === value) return previous.source;
  if (/^[\u0000-\u007f]*$/.test(value)) return value;
  for (const { code } of languageOptions) {
    const source = sourcePhrasesByTranslation.get(code)?.get(value);
    if (source) return source;
  }
  return value;
}

function restoreTranslatedContent() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let textNode = walker.nextNode();
  while (textNode) {
    const previous = translatedNodes.get(textNode);
    if (previous?.translated === textNode.nodeValue) {
      textNode.nodeValue = previous.source;
      translatedNodes.delete(textNode);
    }
    textNode = walker.nextNode();
  }

  document.querySelectorAll("input, textarea, button, [aria-label], [title]").forEach((element) => {
    const previousValues = translatedAttributes.get(element);
    if (!previousValues) return;
    previousValues.forEach((previous, attribute) => {
      if (previous.translated === element.getAttribute(attribute)) {
        element.setAttribute(attribute, previous.source);
      }
    });
    translatedAttributes.delete(element);
  });
}

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
  const { token } = useAuthStore();
  const { initTheme } = useThemeStore();
  const language = useLanguageStore((state) => state.language);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [cachedResponse, setCachedResponse] = useState(null);
  const [pendingMutations, setPendingMutations] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    window.addEventListener("minesight:language-changing", restoreTranslatedContent);
    return () => window.removeEventListener("minesight:language-changing", restoreTranslatedContent);
  }, []);

  useEffect(() => {
    const updateConnection = () => {
      setIsOffline(!navigator.onLine);
      if (navigator.onLine) void syncOfflineMutations();
    };

    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    const showCachedResponse = (event) => setCachedResponse(event.detail);
    const showLiveResponse = (event) => {
      setCachedResponse((current) =>
        current?.key === event.detail.key ? null : current,
      );
    };
    const updateQueue = (event) => {
      if (event.detail.scope && event.detail.scope !== getOfflineCacheScope()) return;
      setPendingMutations(event.detail.count || 0);
      setIsSyncing(Boolean(event.detail.syncing));
    };
    window.addEventListener("minesight:api-cache-hit", showCachedResponse);
    window.addEventListener("minesight:api-live", showLiveResponse);
    window.addEventListener("minesight:offline-queue-updated", updateQueue);
    return () => {
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
      window.removeEventListener("minesight:api-cache-hit", showCachedResponse);
      window.removeEventListener("minesight:api-live", showLiveResponse);
      window.removeEventListener("minesight:offline-queue-updated", updateQueue);
    };
  }, []);

  useEffect(() => {
    void countOfflineMutations().then(setPendingMutations).catch(() => {});
    if (token && navigator.onLine) void syncOfflineMutations();
  }, [token]);

  useEffect(() => {
    initTheme();
  }, []);

  useEffect(() => {
    const translate = i18n.getFixedT(language);
    const translateTextNodes = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const textNodes = [];
      let node = walker.nextNode();
      while (node) {
        textNodes.push(node);
        node = walker.nextNode();
      }
      textNodes.forEach((textNode) => {
        const parent = textNode.parentElement;
        if (!parent || ["SCRIPT", "STYLE", "SELECT", "OPTION"].includes(parent.tagName)) return;
        const previous = translatedNodes.get(textNode);
        const source = getSourcePhrase(textNode.nodeValue, previous);
        const translated = translate(source, { defaultValue: source });
        if (translated !== source) textNode.nodeValue = translated;
        translatedNodes.set(textNode, { source, translated });
      });

      document.querySelectorAll("input, textarea, button, [aria-label], [title]").forEach((element) => {
        ["placeholder", "title", "aria-label"].forEach((attribute) => {
          const value = element.getAttribute(attribute);
          if (!value) return;
          let previousValues = translatedAttributes.get(element);
          if (!previousValues) {
            previousValues = new Map();
            translatedAttributes.set(element, previousValues);
          }
          const previous = previousValues.get(attribute);
          const source = getSourcePhrase(value, previous);
          const translated = translate(source, { defaultValue: source });
          if (translated !== source) element.setAttribute(attribute, translated);
          previousValues.set(attribute, { source, translated });
        });
      });
    };

    translateTextNodes();
    const observer = new MutationObserver(translateTextNodes);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);

  useEffect(() => {
    const enhanceControls = () => {
      document.querySelectorAll("button").forEach((button) => {
        if (button.title) return;

        const label =
          button.getAttribute("aria-label") ||
          button.textContent?.replace(/\s+/g, " ").trim() ||
          "Button";
        button.setAttribute("title", label);
      });
    };

    enhanceControls();
    const observer = new MutationObserver(enhanceControls);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {(isOffline || cachedResponse || pendingMutations > 0) && (
        <div
          className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-center text-xs font-semibold text-amber-950 shadow-sm dark:bg-amber-950 dark:text-amber-100 sm:text-sm"
          role="status"
        >
          {isOffline ? (
            <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <CloudUpload className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span>
            {pendingMutations > 0
              ? isOffline
                ? `Offline: ${pendingMutations} change${pendingMutations === 1 ? "" : "s"} saved on this device; will sync when connected. Live attendance and emergency dispatch need a connection.`
                : isSyncing
                  ? `Syncing ${pendingMutations} saved change${pendingMutations === 1 ? "" : "s"}...`
                  : `${pendingMutations} saved change${pendingMutations === 1 ? "" : "s"} waiting to sync.`
              : isOffline
                ? "Offline mode: saved data is shown when available. Live attendance and emergency dispatch need a connection."
                : `Network issue: showing saved data from ${new Date(cachedResponse.updatedAt).toLocaleTimeString()}.`}
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
