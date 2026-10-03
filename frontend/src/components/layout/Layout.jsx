import { useEffect, useState } from "react";
import { ArrowUp, Camera } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "../common/Footer";
import CoalAiLauncher from "../common/CoalAiLauncher";
import { useLanguageStore } from "../../store/themeStore";
import { translations } from "../../i18n/translations";

export default function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const t = translations[language] || translations.en;
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 320);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const hasLauncher = pathname !== "/app/chat";

  return (
    <div className="app-shell flex min-h-screen flex-col bg-[#f5f7fa] text-gray-700 dark:bg-[#0f1720] dark:text-slate-100">
      <Navbar />

      <main
        className={`flex-1 overflow-x-hidden ${
          pathname === "/app/chat"
            ? "pt-[calc(4rem+var(--status-banner-height,0px))] pb-20 xl:pb-4"
            : "pb-32 pt-[calc(5rem+var(--status-banner-height,0px))] sm:pb-24 xl:pb-12"
        }`}
      >
        <Outlet />
      </main>
      <Footer />
      {hasLauncher && <CoalAiLauncher />}
      {hasLauncher && (
        <button
          type="button"
          onClick={() => navigate("/app/inspections/new")}
          className="fixed bottom-6 right-24 z-40 hidden h-14 w-14 items-center justify-center rounded-full border-4 border-[#d8f3ff] bg-[#0798d1] text-white shadow-[0_8px_22px_rgba(0,0,0,0.28)] transition hover:-translate-y-1 hover:scale-105 hover:bg-[#0788bb] focus:outline-none focus:ring-2 focus:ring-sky-300 xl:inline-flex"
          aria-label="Capture photo"
          title="Capture photo"
        >
          <Camera className="h-5 w-5" />
        </button>
      )}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={`fixed z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#cbbda7] bg-[#fffdf8] text-[#0d3f6d] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f1e8dc] focus:outline-none focus:ring-2 focus:ring-[#0d3f6d] dark:border-slate-700 dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-slate-700 ${
            hasLauncher
              ? "bottom-36 right-4 sm:bottom-36 sm:right-6 xl:bottom-24 xl:right-6"
              : "bottom-20 right-4 sm:bottom-20 sm:right-6 xl:bottom-6 xl:right-6"
          }`}
          aria-label={t.scrollToTop}
          title={t.scrollToTop}
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
