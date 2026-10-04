import { useState, useEffect, useRef } from "react";
import {
  BarChart3,
  Bell,
  ChevronDown,
  ClipboardList,
  Gem,
  Languages,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
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
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import useThemeStore, { useLanguageStore } from "../../store/themeStore";
import { translations } from "../../i18n/translations";
import BrandLogo from "../common/BrandLogo";
import OfflineSyncBadge from "../common/OfflineSyncBadge";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [navigationMenuOpen, setNavigationMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const accountMenuRef = useRef(null);
  const moreMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[language];

  // Core/Primary navigation items always shown directly on desktop navbar
  const primaryNavigation = user?.role === "worker" ? [
    { name: t.myWorkAttendance, href: "/app/workers", icon: ClipboardList },
    { name: t.profile || "Profile", href: "/app/profile", icon: UserCircle },
  ] : [
    { name: t.dashboard, href: "/app", icon: LayoutDashboard },
    { name: t.inspections, href: "/app/inspections", icon: ClipboardList },
    { name: t.attendance || "Attendance", href: "/app/attendance", icon: UserCheck },
    { name: t.compliances, href: "/app/compliances", icon: ShieldCheck },
    { name: t.alerts, href: "/app/alerts", icon: Bell },
  ];

  // Secondary tabs and specialized modules inside "More ▾" dropdown on desktop
  const secondaryNavigation = user?.role === "worker" ? [] : [
    { name: t.analytics, href: "/app/analytics", icon: BarChart3 },
    { name: t.disasterManagement, href: "/app/disaster-management", icon: Siren },
    { name: t.mines, href: "/app/mines", icon: MapPin },
    { name: t.mineralResources, href: "/app/mineral-resources", icon: Gem },
    { name: t.contractors, href: "/app/contractors", icon: Users },
    { name: t.workersTitle, href: "/app/workers", icon: Users },
    { name: t.support || "Support", href: "/app/support", icon: LifeBuoy },
  ];

  const allNavigation = [...primaryNavigation, ...secondaryNavigation];

  const isMoreActive = secondaryNavigation.some(
    (item) => location.pathname === item.href || (item.href !== "/app" && location.pathname.startsWith(item.href))
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setMoreMenuOpen(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setAccountMenuOpen(false);
    setNavigationMenuOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  const handleProfileNavigation = (event) => {
    event.stopPropagation();
    setAccountMenuOpen(false);
    setNavigationMenuOpen(false);
    navigate("/app/profile");
  };

  const languageControl = (
    <button
      type="button"
      onClick={() => setLanguage(language === "en" ? "hi" : "en")}
      className="inline-flex h-8 shrink-0 items-center gap-0.5 rounded-full border border-[#b99a72] bg-[#f4ecdf] p-1 text-[10px] font-bold tracking-wide text-[#5d554b] transition hover:border-[#0d3f6b] max-[380px]:gap-0 max-[380px]:px-0.5 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-sky-400"
      title={t.changeLanguage}
      aria-label={t.changeLanguage}
    >
      <Languages className="mx-1 h-3.5 w-3.5 text-[#0d3f6b] max-[380px]:mx-0.5 max-[380px]:h-3 max-[380px]:w-3 dark:text-sky-300" />
      <span
        className={`rounded-full px-1.5 py-0.5 transition-colors max-[380px]:hidden ${language === "en" ? "bg-[#e5a416] text-[#151719]" : ""}`}
      >
        EN
      </span>
      <span
        className={`rounded-full px-1.5 py-0.5 transition-colors max-[380px]:hidden ${language === "hi" ? "bg-[#e5a416] text-[#151719]" : ""}`}
      >
        हिंदी
      </span>
    </button>
  );

  return (
    <header className="fixed inset-x-0 top-[var(--status-banner-height,0px)] z-40 border-b border-white/10 bg-[#121a21] text-white shadow-[0_8px_24px_rgba(12,18,24,0.22)]">
      {/* Single-Row Clean Desktop & Mobile Header */}
      <div className="flex h-16 min-w-0 items-center justify-between px-3 sm:px-5 xl:px-6">
        {/* Left: Brand Logo */}
        <div className="flex shrink-0 items-center">
          <BrandLogo darkSurface imageClassName="h-9 w-[clamp(7.5rem,24vw,9.5rem)] max-w-full rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6f00] max-[380px]:w-[5.5rem] sm:h-10 sm:w-40" />
        </div>

        {/* Desktop Single-Line Navigation: Core Tabs + More Dropdown */}
        <nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-1 px-2 xl:flex"
          aria-label="Primary navigation"
        >
          {primaryNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === "/app"}
              className={({ isActive }) =>
                `relative flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-lg px-2 py-2 text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? "bg-[#ff6f00] text-white shadow-sm"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <item.icon className="h-3.5 w-3.5 shrink-0" />
              <span className="shrink-0">{item.name}</span>
            </NavLink>
          ))}

          {/* "More" Dropdown Button for Secondary Tabs and Options */}
          {secondaryNavigation.length > 0 && (
            <div className="relative shrink-0" ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => setMoreMenuOpen((open) => !open)}
                className={`relative flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-semibold tracking-wide transition-all ${
                  isMoreActive
                    ? "bg-[#ff6f00] text-white shadow-sm"
                    : "border border-[#ff9a3c]/70 bg-[#ff6f00]/90 text-white shadow-sm hover:bg-[#ff8a33]"
                }`}
                aria-expanded={moreMenuOpen}
                aria-label="More navigation options"
              >
                <Menu className="h-3.5 w-3.5 shrink-0" />
                <span>{language === "hi" ? "अन्य" : "More"}</span>
                <ChevronDown className={`h-3 w-3 shrink-0 transition-transform duration-200 ${moreMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* More Dropdown Popover with 100% Solid Opaque Background */}
              {moreMenuOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl border border-slate-700 bg-[#0d151e] p-2 text-white shadow-2xl ring-1 ring-white/10">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    {language === "hi" ? "अतिरिक्त मॉड्यूल और विकल्प" : "Additional Modules & Options"}
                  </div>
                  <div className="mt-1 space-y-1">
                    {secondaryNavigation.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        onClick={() => setMoreMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                            isActive
                              ? "bg-[#ff6f00] text-white font-semibold shadow-sm"
                              : "text-slate-200 hover:bg-white/10 hover:text-white"
                          }`
                        }
                      >
                        <item.icon className="h-4 w-4 shrink-0 text-[#ff9a3c]" />
                        <span>{item.name}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Right Controls: SOS Help, Language, Theme, User/Hamburger */}
        <div className="relative flex shrink-0 items-center gap-1.5 text-white max-[380px]:gap-0.5 sm:gap-2 sm:ml-3">
          {/* Offline Sync Status */}
          <OfflineSyncBadge />

          {/* Emergency SOS Help */}
          <button
            type="button"
            onClick={() => navigate("/app/support")}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-red-400/80 bg-red-500/15 px-2.5 py-1 text-xs font-bold text-red-300 transition hover:bg-red-500/25 max-[380px]:px-1.5"
            title={t.emergencySupportPanel}
          >
            <LifeBuoy className="h-3.5 w-3.5 text-red-400" />
            <span className="hidden sm:inline">{t.sosHelp}</span>
          </button>

          {/* Language Switcher */}
          {languageControl}

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white transition max-[380px]:p-1.5"
            title={t.toggleTheme}
            aria-label={t.toggleTheme}
          >
            {darkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* Desktop User Profile Button & Dropdown */}
          <div className="relative hidden xl:block" ref={accountMenuRef}>
            <button
              type="button"
              onClick={() => setAccountMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-lg p-1.5 text-sm font-medium hover:bg-white/10 transition"
              aria-expanded={accountMenuOpen}
              aria-label={t.openAccountMenu}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-[#ff6f00] to-[#ffa040] text-xs font-bold text-white shadow-sm">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="hidden text-left xl:block leading-tight">
                <p className="max-w-[120px] truncate text-xs font-semibold text-white">
                  {user?.name || "User"}
                </p>
                <p className="max-w-[120px] truncate text-[10px] capitalize text-white/60">
                  {user?.role?.replace("_", " ") || "Officer"}
                </p>
              </div>
            </button>

            {accountMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 rounded-xl border border-slate-700 bg-[#101923] p-1.5 text-white shadow-2xl">
                <div className="border-b border-slate-700/70 px-3 py-2">
                  <p className="truncate text-sm font-semibold text-white">
                    {user?.name || "User"}
                  </p>
                  <p className="mt-0.5 text-xs capitalize text-white/60">
                    {user?.role?.replace("_", " ") || "Mine official"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleProfileNavigation}
                  className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                >
                  <UserCircle className="h-4 w-4" /> {t.profile}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/15"
                >
                  <LogOut className="h-4 w-4" /> {t.logout}
                </button>
              </div>
            )}
          </div>

          {/* Mobile / Tablet Menu Button (Hamburger) */}
          <button
            type="button"
            onClick={() => {
              setAccountMenuOpen(false);
              setNavigationMenuOpen((open) => !open);
            }}
            className="inline-flex shrink-0 rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white transition max-[380px]:p-1.5 xl:hidden"
            aria-expanded={navigationMenuOpen}
            aria-label={navigationMenuOpen ? "Close navigation menu" : t.openNavigationMenu}
          >
            {navigationMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Hamburger Dropdown: 100% Solid Opaque Background & uses available screen space without forced scrolling */}
      {navigationMenuOpen && (
        <>
          {/* Deep dimmed backdrop covering remaining screen */}
          <div
            className="fixed inset-0 top-[calc(var(--status-banner-height,0px)+4rem)] z-40 bg-black/75 transition-opacity xl:hidden"
            onClick={() => setNavigationMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Mobile Screen Dropdown Panel with 100% SOLID OPAQUE BACKGROUND - expands naturally so all items fit without scrolling */}
          <div className="fixed inset-x-0 top-[calc(var(--status-banner-height,0px)+4rem)] z-50 max-h-[calc(100vh-4.5rem-var(--status-banner-height,0px))] overflow-y-auto border-b border-[#ff6f00]/40 bg-[#0d151d] p-3 text-white shadow-[0_25px_50px_rgba(0,0,0,0.9)] xl:hidden">
            {/* 2-Column Grid of ALL Navigation Items with SOLID OPAQUE Card Backgrounds */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {allNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === "/app"}
                  onClick={() => setNavigationMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-2.5 py-2.5 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#ff6f00] text-white shadow-md border border-[#ffa040]"
                        : "bg-[#162330] text-slate-100 border border-slate-700/70 hover:bg-[#1f3042] hover:text-white"
                    }`
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0 text-[#ff9a3c]" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              ))}
            </div>

            {/* Quick Profile & Logout Footer */}
            <div className="mt-3 flex items-center justify-between border-t border-slate-700/80 pt-2.5 text-xs">
              <button
                type="button"
                onClick={handleProfileNavigation}
                className="relative z-10 inline-flex min-h-10 touch-manipulation items-center gap-1.5 rounded-md bg-[#162330] px-2.5 py-1.5 font-medium text-slate-200 border border-slate-700 hover:bg-[#1f3042] hover:text-white transition"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ff6f00] text-[10px] font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span className="max-w-[140px] truncate">{user?.name || t.profile}</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="relative z-10 inline-flex min-h-10 touch-manipulation items-center gap-1 rounded-md bg-red-950/40 px-2.5 py-1.5 font-medium text-red-400 border border-red-900/60 transition hover:bg-red-900/50 hover:text-red-200 active:bg-red-900/60"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{t.logout}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
