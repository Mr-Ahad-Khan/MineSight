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
    { name: t.workersTitle, href: "/app/workers", icon: Users },
    { name: t.support || "Support", href: "/app/support", icon: LifeBuoy },
    { name: t.disasterManagement, href: "/app/disaster-management", icon: Siren },
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
      title={t.changeLanguage}
      aria-label={t.changeLanguage}
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

  const navLinks = (variant, items = navigation) =>
    items.map((item) => (
      <NavLink
        key={item.name}
        to={item.href}
        end={item.href === "/app"}
        onClick={() => setNavigationMenuOpen(false)}
        className={({ isActive }) =>
          variant === "desktop"
              ? `relative flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-none px-2 py-3 text-[11px] font-semibold transition-colors after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-[#ff6f00] after:transition-transform 2xl:text-xs ${
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
        <span>{item.name}</span>
      </NavLink>
    ));

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-[#121a21]/95 text-white shadow-[0_8px_24px_rgba(12,18,24,0.22)] backdrop-blur-lg">
      {/* Top Header Row (Branding & Global Controls) */}
      <div className="flex h-14 w-full items-center justify-between px-3 sm:px-5 xl:px-6">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <BrandLogo imageClassName="h-9 w-[clamp(7.5rem,25vw,9.5rem)] max-w-full rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6f00] max-[380px]:w-[5.5rem] sm:h-10 sm:w-44" />
          <div className="hidden 2xl:flex items-center gap-2 pl-3 border-l border-white/15 text-xs text-[#9eb5bc]">
            <span className="font-semibold text-white/90">Ministry of Coal</span>
            <span className="text-white/40">•</span>
            <span>Digital Oversight Portal</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="relative flex h-full shrink-0 items-center gap-1 text-white max-[380px]:gap-0.5 sm:gap-2">
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
          <div className="relative hidden xl:block">
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

          {/* Mobile / Tablet Menu Button */}
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

      {/* Desktop Navigation Bar - Shows ALL 13 Tab Names Clearly with Proper View */}
      <nav
        className="navbar-scrollbar-hidden hidden h-11 w-full items-center justify-start 2xl:justify-center gap-1 border-t border-white/10 bg-[#0d151c]/95 px-3 2xl:px-6 overflow-x-auto xl:flex"
        aria-label="Primary navigation"
      >
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === "/app"}
            className={({ isActive }) =>
              `relative flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-semibold tracking-wide transition-all ${
                isActive
                  ? "bg-white/10 text-[#ff9a3c] shadow-sm after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-[#ff6f00]"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <item.icon className="h-3.5 w-3.5 shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Mobile Drawer Navigation (Does NOT cover full mobile screen; w-[290px] max-w-[80vw] with backdrop) */}
      {navigationMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          {/* Dimmed backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setNavigationMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Off-canvas slide drawer */}
          <aside
            className="fixed inset-y-0 right-0 z-50 flex h-full w-[290px] max-w-[80vw] flex-col border-l border-white/10 bg-[#121a21] text-white shadow-2xl transition-transform duration-300 ease-out"
            aria-label="Mobile navigation drawer"
          >
            {/* Drawer Header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4">
              <BrandLogo imageClassName="h-8 w-28 rounded" />
              <button
                type="button"
                onClick={() => setNavigationMenuOpen(false)}
                className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Navigation Links - Fully Scrollable, Never Clipped */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === "/app"}
                  onClick={() => setNavigationMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#ff6f00] text-white font-semibold shadow-md"
                        : "text-white/75 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              ))}
            </div>

            {/* Drawer Footer (User Profile & Logout) */}
            <div className="shrink-0 border-t border-white/10 p-3 bg-[#0d141a]">
              <button
                type="button"
                onClick={() => {
                  navigate("/app/profile");
                  setNavigationMenuOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#ff6f00] to-[#ffa040] text-xs font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="min-w-0 text-left">
                  <p className="truncate text-xs font-semibold text-white">
                    {user?.name || "User"}
                  </p>
                  <p className="truncate text-[10px] capitalize text-white/60">
                    {user?.role?.replace("_", " ") || "Officer"}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNavigationMenuOpen(false);
                  handleLogout();
                }}
                className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/15 transition"
              >
                <LogOut className="h-4 w-4" />
                <span>{t.logout}</span>
              </button>
            </div>
          </aside>
        </div>
      )}

    </header>
  );
}
