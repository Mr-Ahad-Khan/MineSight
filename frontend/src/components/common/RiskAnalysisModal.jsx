import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  AlertTriangle,
  X,
  Check,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";

export default function RiskAnalysisModal({
  isOpen,
  onClose,
  riskData,
  onApplyFindings,
  photoPreview,
}) {
  if (!isOpen || !riskData) return null;

  const {
    riskScore = 0,
    riskLevel = "medium",
    hazards = [],
    observations = "",
    recommendation = "",
    suggestedViolation,
    source = "online_ai",
  } = riskData;

  const getScoreColor = (score) => {
    if (score >= 80) return "text-rose-600 dark:text-rose-400 border-rose-500 bg-rose-50 dark:bg-rose-950/40";
    if (score >= 60) return "text-amber-600 dark:text-amber-400 border-amber-500 bg-amber-50 dark:bg-amber-950/40";
    if (score >= 35) return "text-yellow-600 dark:text-yellow-400 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/40";
    return "text-emerald-600 dark:text-emerald-400 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40";
  };

  const getProgressBarColor = (score) => {
    if (score >= 80) return "bg-rose-500";
    if (score >= 60) return "bg-amber-500";
    if (score >= 35) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-sky-100 p-2 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                AI Photo Risk Assessment
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated hazard recognition & DGMS safety classification
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Top Summary Banner */}
          <div className="flex flex-col sm:flex-row items-center gap-4 rounded-xl border p-4 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700">
            {photoPreview && (
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                <img
                  src={photoPreview}
                  alt="Assessed Photo"
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="flex-1 w-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Risk Score
                </span>
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                  {source === "online_ai" ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Online Cloud AI
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      ⚡ Offline Edge AI
                    </>
                  )}
                </span>
              </div>

              {/* Score Display & Bar */}
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-black ${getScoreColor(riskScore).split(" ")[0]}`}>
                  {riskScore}
                </span>
                <span className="text-xs font-medium text-slate-400">/ 100</span>
                <span
                  className={`ml-auto rounded-md border px-2 py-0.5 text-xs font-bold uppercase ${getScoreColor(
                    riskScore
                  )}`}
                >
                  {riskLevel} Risk
                </span>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className={`h-full transition-all duration-500 ${getProgressBarColor(riskScore)}`}
                  style={{ width: `${Math.min(100, Math.max(5, riskScore))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Detected Hazards List */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Identified Safety Hazards ({hazards.length})
            </h4>
            <div className="space-y-2.5">
              {hazards.map((hazard, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        className={`h-4 w-4 shrink-0 ${
                          hazard.severity === "critical"
                            ? "text-rose-500"
                            : hazard.severity === "high"
                            ? "text-amber-500"
                            : "text-yellow-500"
                        }`}
                      />
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {hazard.label}
                      </span>
                    </div>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      {hazard.confidence}% Match
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
                    {hazard.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Observations */}
          {observations && (
            <div className="rounded-xl border border-slate-200 bg-sky-50/50 p-3.5 dark:border-slate-700 dark:bg-sky-950/20 space-y-1">
              <span className="text-xs font-semibold text-sky-800 dark:text-sky-300">
                Visual Inspection Findings:
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {observations}
              </p>
            </div>
          )}

          {/* Corrective Action */}
          {recommendation && (
            <div className="rounded-xl border border-slate-200 bg-amber-50/50 p-3.5 dark:border-slate-700 dark:bg-amber-950/20 space-y-1">
              <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                DGMS Compliance Recommendation:
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {recommendation}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-900/90">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          >
            Dismiss
          </button>

          {onApplyFindings && (
            <button
              type="button"
              onClick={() => {
                onApplyFindings(riskData);
                onClose();
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0b3d91] dark:bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-[#0a2f6d] dark:hover:bg-sky-500 shadow-sm transition"
            >
              <Check className="h-4 w-4" />
              Apply Findings to Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
