import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "../common/Footer";
import CoalAiLauncher from "../common/CoalAiLauncher";

export default function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="app-shell flex min-h-screen flex-col bg-[#f5f7fa] text-gray-700 dark:bg-[#0f1720] dark:text-slate-100">
      <Navbar />

      <main className="flex-1 overflow-x-hidden pt-16">
        <Outlet />
      </main>
      <Footer />
      {pathname !== "/app/chat" && <CoalAiLauncher />}
    </div>
  );
}
