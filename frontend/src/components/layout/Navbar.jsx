import { useState } from "react";
import {
  BarChart3,
  Bell,
  ClipboardList,
  Languages,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Moon,
  ShieldCheck,
  Sun,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import useThemeStore, { useLanguageStore } from "../../store/themeStore";
import { translations } from "../../i18n/translations";
import BrandLogo from "../common/BrandLogo";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [navigationMenuOpen, setNavigationMenuOpen] = useState(false);
  const navigate = useNavigate();
  const t = translations[language];

  const navigation = [
    { name: t.dashboard, href: "/app", icon: LayoutDashboard },
    { name: t.inspections, href: "/app/inspections", icon: ClipboardList },
    { name: t.compliances, href: "/app/compliances", icon: ShieldCheck },
    { name: t.mines, href: "/app/mines", icon: MapPin },
    { name: t.contractors, href: "/app/contractors", icon: Users },
    { name: t.alerts, href: "/app/alerts", icon: Bell },
    { name: t.analytics, href: "/app/analytics", icon: BarChart3 },
    { name: "Coal AI", href: "/app/chat", icon: MessageCircle },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const languageControl = (
    <button
      type="button"
      onClick={() => setLanguage(language === "en" ? "hi" : "en")}
      className="inline-flex h-9 items-center gap-1 rounded-full border border-[#b99a72] bg-[#f4ecdf] px-2 text-[10px] font-bold tracking-wide text-[#5d554b] transition hover:border-[#0d3f6b] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-sky-400"
      title="Change language"
      aria-label="Change language"
    >
      <Languages className="h-3.5 w-3.5 text-[#0d3f6b] dark:text-sky-300" />
      <span className="hidden sm:inline">
        {language === "en" ? "EN" : "हिंदी"}
      </span>
      <span className="sm:hidden">{language === "en" ? "EN" : "हि"}</span>
    </button>
  );

  const navLinks = (variant) =>
    navigation.map((item) => (
      <NavLink
        key={item.name}
        to={item.href}
        end={item.href === "/app"}
        onClick={() => setNavigationMenuOpen(false)}
        className={({ isActive }) =>
          variant === "desktop"
            ? `flex min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-[#d9e7f4] text-[#0d3f6b] dark:bg-slate-800 dark:text-white"
                  : "text-[#3a3a3a] hover:bg-[#f4ecdf] hover:text-[#152b3d] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              }`
            : `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-[#0d3f6b] text-white"
                  : "bg-[#f6f0e5] text-[#304451] hover:bg-[#e8dfcf] dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`
        }
      >
        <item.icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{item.name}</span>
      </NavLink>
    ));

  return (
    <header className="sticky top-0 z-30 border-b border-[#d7c7ab] bg-[#e8dfcf] shadow-[0_2px_8px_rgba(74,54,32,0.08)] dark:border-slate-700 dark:bg-[#111c24] dark:shadow-none">
      <div className="flex h-14 min-w-0 items-center sm:h-16 lg:h-[72px]">
        <div className="flex h-full min-w-0 shrink-0 items-center bg-white px-3 sm:px-5 dark:bg-[#171b22] xl:pr-8">
          <BrandLogo imageClassName="h-12 w-36 sm:h-14 sm:w-44" />
        </div>

        <nav
          className="hidden min-w-0 flex-1 grid-cols-8 gap-1 px-3 xl:grid"
          aria-label="Primary navigation"
        >
          {navLinks("desktop")}
        </nav>

        <div className="relative ml-auto flex h-full shrink-0 items-center gap-1 px-2 text-[#3a3a3a] sm:gap-2 sm:px-3 dark:text-slate-200">
          {languageControl}
          <button
            onClick={toggleDarkMode}
            className="rounded-lg p-2 hover:bg-[#efe7da] dark:hover:bg-slate-800"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setAccountMenuOpen(false);
              setNavigationMenuOpen((open) => !open);
            }}
            className="rounded-lg p-2 hover:bg-[#efe7da] dark:hover:bg-slate-800 xl:hidden"
            aria-expanded={navigationMenuOpen}
            aria-label="Open navigation menu"
          >
            {navigationMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setNavigationMenuOpen(false);
              setAccountMenuOpen((open) => !open);
            }}
            className="hidden rounded-lg p-2 hover:bg-[#efe7da] dark:hover:bg-slate-800 xl:inline-flex"
            aria-expanded={accountMenuOpen}
            aria-label="Open account menu"
          >
            <UserCircle className="h-5 w-5" />
          </button>

          {accountMenuOpen && (
            <div className="absolute right-2 top-[calc(100%+0.35rem)] z-50 w-60 rounded-xl border border-[#c9b69d] bg-[#fffdf8] p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <div className="border-b border-[#e1d3bc] px-3 py-2.5 dark:border-slate-700">
                <p className="truncate text-sm font-semibold text-[#17314a] dark:text-white">
                  {user?.name || "User"}
                </p>
                <p className="mt-0.5 text-xs capitalize text-[#655b4e] dark:text-slate-400">
                  {user?.role?.replace("_", " ") || "Mine official"}
                </p>
              </div>
              <button
                onClick={() => {
                  navigate("/app/profile");
                  setAccountMenuOpen(false);
                }}
                className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[#f3eadb] dark:hover:bg-slate-800"
              >
                <UserCircle className="h-4 w-4" /> Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {navigationMenuOpen && (
        <div className="border-t border-[#d7c7ab] bg-[#fffdf8] p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900 xl:hidden">
          <nav
            className="grid grid-cols-2 gap-2"
            aria-label="Mobile navigation"
          >
            {navLinks("mobile")}
          </nav>
          <div className="mt-3 flex items-center justify-between border-t border-[#e1d3bc] pt-3 dark:border-slate-700">
            <button
              onClick={() => {
                navigate("/app/profile");
                setNavigationMenuOpen(false);
              }}
              className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium hover:bg-[#f3eadb] dark:hover:bg-slate-800"
            >
              <UserCircle className="h-4 w-4" /> Profile
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
