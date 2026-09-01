import { useEffect, useState } from 'react'
import { getAnalytics } from '../services/api'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { useLanguageStore } from '../store/themeStore'
import { translations } from '../i18n/translations'

const COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444']

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { language } = useLanguageStore()
  const t = translations[language]

  useEffect(() => {
    getAnalytics()
      .then((res) => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const recurringData = (data?.recurringViolations || []).map((v) => ({
    name: v.category,
    count: v.count,
  }))

  const trendData = (data?.monthlyTrend || []).map((t) => ({
    name: `${t._id.month}/${t._id.year}`,
    inspections: t.count,
    avgRisk: Math.round(t.avgRisk || 0),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.analytics}</h1>
        <p className="text-sm text-slate-500 mt-1">{t.insightSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recurring Violations */}
        <div className="card p-5">
          <h2 className="font-semibold mb-4">{t.recurringViolations}</h2>
          {recurringData.length === 0 ? (
            <p className="text-slate-400 text-sm">{t.noDataAvailable}</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={recurringData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="card p-5">
          <h2 className="font-semibold mb-4">{t.inspectionTrend}</h2>
          {trendData.length === 0 ? (
            <p className="text-slate-400 text-sm">{t.noDataAvailable}</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="inspections" fill="#0f766e" radius={[4, 4, 0, 0]} name="Inspections" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* High Risk List */}
      <div className="card p-5">
        <h2 className="font-semibold mb-4">{t.highRiskInspections}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Mine</th>
                <th className="px-4 py-3 font-medium">Risk Score</th>
                <th className="px-4 py-3 font-medium">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(data?.highRiskInspections || []).map((insp) => (
                <tr key={insp._id}>
                  <td className="px-4 py-3 font-medium">{insp.title}</td>
                  <td className="px-4 py-3">{insp.mineId?.name || '—'}</td>
                  <td className="px-4 py-3 font-bold text-red-600">{insp.riskScore}</td>
                  <td className="px-4 py-3 capitalize">{insp.severity}</td>
                </tr>
              ))}
              {(!data?.highRiskInspections || data.highRiskInspections.length === 0) && (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-slate-400">{t.noHighRisk}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}