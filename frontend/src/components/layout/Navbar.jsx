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
import { NavLink, useNavigate, useLocation } from "react-router-dom";
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
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const accountMenuRef = useRef(null);
  const moreMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[language];

  const primaryNavigation = user?.role === "worker" ? [
    { name: t.myWorkAttendance, href: "/app/workers", icon: ClipboardList },
    { name: t.profile || "Profile", href: "/app/profile", icon: UserCircle },
  ] : [
    { name: t.dashboard, href: "/app", icon: LayoutDashboard },
    { name: t.inspections, href: "/app/inspections", icon: ClipboardList },
    { name: t.attendance || "Attendance", href: "/app/attendance", icon: UserCheck },
    { name: t.compliances, href: "/app/compliances", icon: ShieldCheck },
    { name: t.mines, href: "/app/mines", icon: MapPin },
    { name: t.mineralResources, href: "/app/mineral-resources", icon: Gem },
    { name: t.contractors, href: "/app/contractors", icon: Users },
    { name: t.alerts, href: "/app/alerts", icon: Bell },
    { name: t.analytics, href: "/app/analytics", icon: BarChart3 },
  ];

  const secondaryNavigation = user?.role === "worker" ? [] : [
    { name: t.workersTitle, href: "/app/workers", icon: Users },
    { name: t.support || "Support", href: "/app/support", icon: LifeBuoy },
    { name: t.disasterManagement, href: "/app/disaster-management", icon: Siren },
    { name: t.coalAi, href: "/app/chat", icon: MessageCircle },
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
    logout();
    navigate("/login");
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
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#121a21]/95 text-white shadow-[0_8px_24px_rgba(12,18,24,0.22)] backdrop-blur-lg">
      {/* Single-Row Clean Desktop & Mobile Header */}
      <div className="flex h-16 min-w-0 items-center justify-between px-3 sm:px-5 xl:px-6">
        {/* Left: Brand Logo */}
        <div className="flex shrink-0 items-center">
          <BrandLogo imageClassName="h-9 w-[clamp(7.5rem,24vw,9.5rem)] max-w-full rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6f00] max-[380px]:w-[5.5rem] sm:h-10 sm:w-40" />
        </div>

        {/* Desktop Single-Line Navigation: Primary Tabs + More Dropdown */}
        <nav
          className="navbar-scrollbar-hidden hidden min-w-0 flex-1 items-center justify-start xl:justify-center gap-0.5 px-3 overflow-x-auto xl:flex"
          aria-label="Primary navigation"
        >
          {primaryNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === "/app"}
              className={({ isActive }) =>
                `relative flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? "bg-white/10 text-[#ff9a3c] shadow-sm after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-[#ff6f00]"
                    : "text-white/75 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon className="h-3.5 w-3.5 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}

          {/* "More" Dropdown Button for Secondary Tabs */}
          {secondaryNavigation.length > 0 && (
            <div className="relative shrink-0" ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => setMoreMenuOpen((open) => !open)}
                className={`relative flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-semibold tracking-wide transition-all ${
                  isMoreActive
                    ? "bg-white/10 text-[#ff9a3c] shadow-sm after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-[#ff6f00]"
                    : "text-white/75 hover:bg-white/5 hover:text-white"
                }`}
                aria-expanded={moreMenuOpen}
                aria-label="More navigation options"
              >
                <Menu className="h-3.5 w-3.5 shrink-0" />
                <span>{language === "hi" ? "अन्य" : "More"}</span>
                <ChevronDown className={`h-3 w-3 shrink-0 transition-transform ${moreMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* More Dropdown Popover */}
              {moreMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 rounded-xl border border-slate-700 bg-[#141e27] p-1.5 text-white shadow-2xl backdrop-blur-md">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/50 border-b border-white/10">
                    {language === "hi" ? "अतिरिक्त मॉड्यूल" : "Additional Modules"}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {secondaryNavigation.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        onClick={() => setMoreMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                            isActive
                              ? "bg-[#ff6f00] text-white font-semibold"
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
        <div className="relative flex shrink-0 items-center gap-1.5 text-white max-[380px]:gap-0.5 sm:gap-2">
          {/* Emergency SOS Help */}
          <button
            type="button"
            onClick={() => navigate("/app/support")}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-400/80 bg-red-500/15 px-2.5 py-1 text-xs font-bold text-red-300 transition hover:bg-red-500/25 max-[380px]:px-1.5"
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
              <div className="hidden text-left 2xl:block leading-tight">
                <p className="max-w-[120px] truncate text-xs font-semibold text-white">
                  {user?.name || "User"}
                </p>
                <p className="max-w-[120px] truncate text-[10px] capitalize text-white/60">
                  {user?.role?.replace("_", " ") || "Officer"}
                </p>
              </div>
            </button>

            {accountMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 rounded-xl border border-slate-700 bg-[#141e27] p-1.5 text-white shadow-2xl backdrop-blur-md">
                <div className="border-b border-white/10 px-3 py-2">
                  <p className="truncate text-sm font-semibold text-white">
                    {user?.name || "User"}
                  </p>
                  <p className="mt-0.5 text-xs capitalize text-white/60">
                    {user?.role?.replace("_", " ") || "Mine official"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigate("/app/profile");
                    setAccountMenuOpen(false);
                  }}
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

      {/* Mobile Hamburger Dropdown: Uses ONLY ~30% of Mobile Screen Height */}
      {navigationMenuOpen && (
        <>
          {/* Dimmed backdrop covering remaining 70% of screen */}
          <div
            className="fixed inset-x-0 bottom-0 top-16 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity xl:hidden"
            onClick={() => setNavigationMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Compact 30% Mobile Screen Dropdown Panel */}
          <div className="fixed inset-x-0 top-16 z-50 max-h-[32vh] overflow-y-auto border-b border-white/10 bg-[#121a21]/98 p-3 shadow-2xl backdrop-blur-xl xl:hidden">
            {/* 2-Column Grid of ALL Navigation Items */}
            <div className="grid grid-cols-2 gap-1.5">
              {allNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === "/app"}
                  onClick={() => setNavigationMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-[#ff6f00] text-white font-semibold shadow-sm"
                        : "bg-white/5 text-white/85 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <item.icon className="h-3.5 w-3.5 shrink-0 text-[#ff9a3c]" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              ))}
            </div>

            {/* Quick Profile & Logout Footer inside the 30% panel */}
            <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  navigate("/app/profile");
                  setNavigationMenuOpen(false);
                }}
                className="inline-flex items-center gap-1.5 text-white/80 hover:text-white"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ff6f00] text-[10px] font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span className="max-w-[130px] truncate">{user?.name || t.profile}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNavigationMenuOpen(false);
                  handleLogout();
                }}
                className="inline-flex items-center gap-1 text-red-400 hover:text-red-300"
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
