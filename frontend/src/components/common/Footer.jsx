import BrandLogo from "./BrandLogo";
import { useLanguageStore } from "../../store/themeStore";
import { translations } from "../../i18n/translations";

export default function Footer() {
  const { language } = useLanguageStore();
  const t = translations[language];

  return (
    <footer className="border-t border-[#29414b] bg-[#0b171d] text-[#c5cfce]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div>
            <BrandLogo imageClassName="h-16 w-44 rounded" />
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#9eafaf]">
              {t.footerTagline}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#e5a416]">
              {t.platform}
            </h3>
            <div className="mt-4 flex flex-col gap-2.5 text-sm text-[#b5c2c1]">
              <span>{t.riskSafety}</span>
              <span>{t.complianceRecords}</span>
              <span>{t.fieldInspections}</span>
              <span>{t.siteIntelligence}</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#e5a416]">
              {t.support}
            </h3>
            <div className="mt-4 flex flex-col gap-2.5 text-sm text-[#b5c2c1]">
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

          <div>
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

        <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-4 text-xs text-[#758b8e] sm:flex-row sm:items-center sm:justify-between">
          <p>{t.footerCopyright}</p>
          <p>{t.version}</p>
        </div>
      </div>
    </footer>
  );
}
