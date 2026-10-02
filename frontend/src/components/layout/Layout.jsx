import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "../common/Footer";
import CoalAiLauncher from "../common/CoalAiLauncher";

export default function Layout() {
  const { pathname } = useLocation();
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

      <main className="flex-1 overflow-x-hidden pb-32 pt-20 sm:pb-24 xl:pb-12">
        <Outlet />
      </main>
      <Footer />
      {hasLauncher && <CoalAiLauncher />}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={`fixed z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#cbbda7] bg-[#fffdf8] text-[#0d3f6d] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f1e8dc] focus:outline-none focus:ring-2 focus:ring-[#0d3f6d] dark:border-slate-700 dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-slate-700 ${
            hasLauncher
              ? "bottom-24 right-4 sm:bottom-24 sm:right-6 xl:bottom-24 xl:right-6"
              : "bottom-6 right-4 sm:bottom-6 sm:right-6"
          }`}
          aria-label="Scroll to top"
          title="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
