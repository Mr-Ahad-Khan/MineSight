import BrandLogo from "./BrandLogo";

export default function Footer() {
  return (
    <footer className="border-t border-[#29414b] bg-[#0b171d] text-[#c5cfce]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div>
            <BrandLogo imageClassName="h-16 w-44 rounded" />
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#9eafaf]">
              Practical tools for safer mines, clearer compliance, and better
              decisions across every site.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#e5a416]">
              Platform
            </h3>
            <div className="mt-4 flex flex-col gap-2.5 text-sm text-[#b5c2c1]">
              <span>Risk and safety</span>
              <span>Compliance records</span>
              <span>Field inspections</span>
              <span>Site intelligence</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#e5a416]">
              Support
            </h3>
            <div className="mt-4 flex flex-col gap-2.5 text-sm text-[#b5c2c1]">
              <a
                href="mailto:support@coalgovernance.in"
                className="transition-colors hover:text-white"
              >
                Contact support
              </a>
              <span>Access help</span>
              <span>Security</span>
              <span>Privacy</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#e5a416]">
              System status
            </h3>
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-[#83d2c5]">
              <span className="h-2 w-2 rounded-full bg-[#39c7b0]" />
              All systems operational
            </div>
            <p className="mt-3 text-xs text-[#758b8e]">
              Support hours: Mon-Fri, 09:00-18:00 IST
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-4 text-xs text-[#758b8e] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Coal Governance. Built for responsible mine operations.</p>
          <p>MineSight platform · Version 1.0</p>
        </div>
      </div>
    </footer>
  );
}
