import { useState } from "react";
import {
  BarChart3,
  Bell,
  ClipboardList,
  Gem,
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
  UserCheck,
  LifeBuoy,
  Siren,
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

  const navigation = user?.role === "worker" ? [
    { name: "My Work & Attendance", href: "/app/workers", icon: ClipboardList },
  ] : [
    { name: t.dashboard, href: "/app", icon: LayoutDashboard },
    { name: t.inspections, href: "/app/inspections", icon: ClipboardList },
    { name: t.attendance || "Attendance", href: "/app/attendance", icon: UserCheck },
    { name: t.compliances, href: "/app/compliances", icon: ShieldCheck },
    { name: t.mines, href: "/app/mines", icon: MapPin },
    { name: "Mineral Resources", href: "/app/mineral-resources", icon: Gem },
    { name: t.contractors, href: "/app/contractors", icon: Users },
    { name: t.alerts, href: "/app/alerts", icon: Bell },
    { name: t.analytics, href: "/app/analytics", icon: BarChart3 },
    { name: "Workers", href: "/app/workers", icon: Users },
    { name: t.support || "Support", href: "/app/support", icon: LifeBuoy },
    { name: "Disaster Management", href: "/app/disaster-management", icon: Siren },
    { name: t.coalAi, href: "/app/chat", icon: MessageCircle },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const languageControl = (
    <button
      type="button"
      onClick={() => setLanguage(language === "en" ? "hi" : "en")}
      className="inline-flex h-9 shrink-0 items-center gap-0.5 rounded-full border border-[#b99a72] bg-[#f4ecdf] p-1 text-[10px] font-bold tracking-wide text-[#5d554b] transition hover:border-[#0d3f6b] max-[380px]:gap-0 max-[380px]:px-0.5 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-sky-400"
      title="Change language"
      aria-label="Change language"
    >
      <Languages className="mx-1 h-3.5 w-3.5 text-[#0d3f6b] max-[380px]:mx-0.5 max-[380px]:h-3 max-[380px]:w-3 dark:text-sky-300" />
      <span
        className={`rounded-full px-2 py-1 transition-colors max-[380px]:hidden ${language === "en" ? "bg-[#e5a416] text-[#151719]" : ""}`}
      >
        EN
      </span>
      <span
        className={`rounded-full px-2 py-1 transition-colors max-[380px]:hidden ${language === "hi" ? "bg-[#e5a416] text-[#151719]" : ""}`}
      >
        हिंदी
      </span>
    </button>
  );

  const mobileOverflowNavigation = navigation.slice(4);

  const navLinks = (variant, items = navigation) =>
    items.map((item) => (
      <NavLink
        key={item.name}
        to={item.href}
        end={item.href === "/app"}
        onClick={() => setNavigationMenuOpen(false)}
        className={({ isActive }) =>
          variant === "desktop"
              ? `relative flex min-w-0 items-center justify-center gap-1 whitespace-nowrap rounded-none px-1 py-3 text-[10px] font-semibold transition-colors after:absolute after:inset-x-1 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-[#ff6f00] after:transition-transform 2xl:text-xs ${
                isActive
                  ? "text-white after:scale-x-100"
                  : "text-white/70 hover:text-white hover:after:scale-x-100"
              }`
            : `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-[#ff6f00] text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`
        }
      >
        <item.icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{item.name}</span>
      </NavLink>
    ));

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-[#121a21]/95 text-white shadow-[0_8px_24px_rgba(12,18,24,0.22)] backdrop-blur-lg">
      <div className="grid h-16 min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center">
        <div className="flex h-full min-w-0 items-center px-3 sm:px-5 xl:pr-8">
          <BrandLogo imageClassName="h-10 w-[clamp(7.5rem,30vw,9.5rem)] max-w-full rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6f00] max-[380px]:w-[5.5rem] sm:h-12 sm:w-48" />
        </div>

        <nav
          className="navbar-scrollbar-hidden hidden min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto px-1 xl:flex"
          aria-label="Primary navigation"
        >
          {navLinks("desktop")}
        </nav>

        <div className="relative flex h-full shrink-0 items-center gap-1 px-2 text-white max-[380px]:gap-0 max-[380px]:px-1 sm:gap-2 sm:px-3">
          <button
            type="button"
            onClick={() => navigate("/app/support")}
            className="inline-flex items-center gap-1 rounded-full border border-red-300/80 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
            title="Emergency Support Panel"
          >
            <LifeBuoy className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">SOS Help</span>
          </button>
          {languageControl}
          <button
            onClick={toggleDarkMode}
            className="rounded-lg p-2 hover:bg-white/10 max-[380px]:p-1.5"
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
            className="inline-flex shrink-0 rounded-lg p-2 hover:bg-white/10 max-[380px]:p-1.5 xl:hidden"
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
            className="hidden rounded-lg p-2 hover:bg-white/10 xl:inline-flex"
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
                <UserCircle className="h-4 w-4" /> {t.profile}
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <LogOut className="h-4 w-4" /> {t.logout}
              </button>
            </div>
          )}
        </div>
      </div>

      {navigationMenuOpen && (
        <div className="border-t border-white/10 bg-[#121a21] p-3 shadow-lg xl:hidden">
          <nav
            className="grid grid-cols-2 gap-2"
            aria-label="Mobile navigation"
          >
            {navLinks("mobile", mobileOverflowNavigation)}
          </nav>
          <div className="mt-3 flex items-center justify-between border-t border-[#e1d3bc] pt-3 dark:border-slate-700">
            <button
              onClick={() => {
                navigate("/app/profile");
                setNavigationMenuOpen(false);
              }}
              className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium hover:bg-[#f3eadb] dark:hover:bg-slate-800"
            >
              <UserCircle className="h-4 w-4" /> {t.profile}
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <LogOut className="h-4 w-4" /> {t.logout}
            </button>
          </div>
        </div>
      )}

    </header>
  );
}
