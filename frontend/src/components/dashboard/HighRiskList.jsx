import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { useLanguageStore } from '../../store/themeStore'
import { translations } from '../../i18n/translations'

const severityBadge = {
  low: 'badge-low',
  medium: 'badge-medium',
  high: 'badge-high',
  critical: 'badge-critical',
}

export default function HighRiskList({ inspections }) {
  const { language } = useLanguageStore()
  const t = translations[language]

  if (!inspections || inspections.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">{t.noHighRisk}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 w-full">
      {inspections.slice(0, 5).map((insp) => (
        <Link
          key={insp._id}
          to={`/inspections/${insp._id}`}
          className="dashboard-subcard flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{insp.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {insp.mineId?.name || (language === 'hi' ? 'अज्ञात खदान' : 'Unknown Mine')} • {language === 'hi' ? 'जोखिम स्कोर' : 'Risk Score'}: {insp.riskScore}
            </p>
          </div>
          <span className={`badge ${severityBadge[insp.severity] || 'badge-medium'} ml-3 shrink-0`}>
            {insp.severity}
          </span>
        </Link>
      ))}
    </div>
  )
}