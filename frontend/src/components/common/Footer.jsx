import BrandLogo from "./BrandLogo";
import {
  Camera,
  LayoutDashboard,
  ClipboardList,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { useLanguageStore } from "../../store/themeStore";
import { translations } from "../../i18n/translations";

export default function Footer({ onOpenScan }) {
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const location = useLocation();
  const isChat = location.pathname === "/app/chat";
  const t = translations[language];
  const navigation =
    user?.role === "worker"
      ? [
          {
            name: t.myWorkAttendance,
            href: "/app/workers",
            icon: ClipboardList,
          },
        ]
      : [
          { name: t.dashboard, href: "/app", icon: LayoutDashboard },
          {
            name: t.inspections,
            href: "/app/inspections",
            icon: ClipboardList,
          },
          {
            name: t.attendance || "Attendance",
            href: "/app/attendance",
            icon: UserCheck,
          },
          { name: t.compliances, href: "/app/compliances", icon: ShieldCheck },
        ];
  const mobileNavigation = [
    ...navigation.slice(0, 2),
    {
      name: t.capture || (language === "hi" ? "कैप्चर" : "Capture"),
      isCapture: true,
      icon: Camera,
    },
    ...navigation.slice(2),
  ];

  const handleCaptureClick = (e) => {
    e.preventDefault();
    if (onOpenScan) {
      onOpenScan();
    } else {
      window.dispatchEvent(new CustomEvent("minesight:open-camera-scan"));
    }
  };

  return (
    <footer
      className={
        isChat
          ? "xl:hidden"
          : "border-t border-white/10 bg-[#212121] pb-24 text-white/75 xl:pb-0"
      }
    >
      {!isChat && (
        <div className="mx-auto max-w-7xl px-4 py-10 text-center sm:px-6 sm:text-left lg:px-8">
          <div className="grid justify-items-center gap-8 md:grid-cols-2 md:justify-items-stretch xl:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
            <div className="flex flex-col items-center md:items-start">
              <BrandLogo
                darkSurface
                forceLogo="minesight-logo.svg"
                imageClassName="h-16 w-44 rounded"
              />
              <p className="mt-4 max-w-sm text-sm leading-6 text-[#9eafaf]">
                {t.footerTagline}
              </p>
            </div>

            <div className="w-full">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#e5a416]">
                {t.platform}
              </h3>
              <div className="mt-4 flex flex-col items-center gap-2.5 text-sm text-[#b5c2c1] md:items-start">
                <span>{t.riskSafety}</span>
                <span>{t.complianceRecords}</span>
                <span>{t.fieldInspections}</span>
                <span>{t.siteIntelligence}</span>
              </div>
            </div>

            <div className="w-full">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#e5a416]">
                {t.support}
              </h3>
              <div className="mt-4 flex flex-col items-center gap-2.5 text-sm text-[#b5c2c1] md:items-start">
                <a
                  href="mailto:support@coalgovernance.in"
                  className="transition-colors hover:text-white"
                >
                  {t.contactSupport}
                </a>
                <span>{t.accessHelp}</span>
                <span>{t.security}</span>
                <span>{t.privacy}</span>
              </div>
            </div>

            <div className="w-full">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#e5a416]">
                {t.systemStatus}
              </h3>
              <div className="mt-4 inline-flex items-center gap-2 text-sm text-[#83d2c5]">
                <span className="h-2 w-2 rounded-full bg-[#39c7b0]" />
                {t.allSystemsOperational}
              </div>
              <p className="mt-3 text-xs text-[#758b8e]">{t.supportHours}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-2 border-t border-white/10 pt-4 text-xs text-[#758b8e] sm:flex-row sm:items-center sm:justify-between">
            <p>{t.footerCopyright}</p>
            <p>{t.version}</p>
          </div>
        </div>
      )}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-5 border-t border-white/10 bg-[#121a21]/95 px-1 text-white shadow-[0_-8px_24px_rgba(12,18,24,0.22)] backdrop-blur-lg xl:hidden"
        aria-label="Footer navigation"
      >
        {mobileNavigation.map((item) => {
          if (item.isCapture) {
            return (
              <button
                key="mobile-nav-capture"
                type="button"
                onClick={handleCaptureClick}
                aria-label="Capture and Scan Photo"
                className="flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-semibold text-white/80 hover:text-white transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-white shadow-md">
                  <item.icon className="h-4 w-4 shrink-0" />
                </div>
                <span className="w-full truncate text-center text-sky-400 font-medium">
                  {item.name}
                </span>
              </button>
            );
          }
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/app"}
              aria-label={item.name}
              className={({ isActive }) =>
                `flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-3 text-[10px] font-semibold transition-colors ${
                  isActive ? "text-[#ff9a3c]" : "text-white/65 hover:text-white"
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="w-full truncate text-center">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </footer>
  );
}
