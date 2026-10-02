import { useEffect, useState } from 'react'
import { getAnalytics } from '../services/api'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, Legend
} from 'recharts'
import { useLanguageStore } from '../store/themeStore'
import { translations } from '../i18n/translations'
import TableScrollContainer from '../components/common/TableScrollContainer'

const COLORS = ['#2563eb', '#0d9488', '#ff6f00', '#ef4444']

const getPercentChange = (current, previous) => {
  if (previous === 0) return current === 0 ? 0 : 100
  return Math.round(((current - previous) / previous) * 100)
}

const buildRiskForecast = (monthlyTrend) => {
  const observations = (monthlyTrend || [])
    .filter((item) => Number.isFinite(item.avgRisk) && item.count > 0)
    .map((item) => ({
      monthIndex: item._id.year * 12 + item._id.month - 1,
      risk: item.avgRisk,
    }))
    .sort((left, right) => left.monthIndex - right.monthIndex)

  if (observations.length < 3) return null

  const meanX = observations.reduce((sum, item) => sum + item.monthIndex, 0) / observations.length
  const meanY = observations.reduce((sum, item) => sum + item.risk, 0) / observations.length
  const denominator = observations.reduce((sum, item) => sum + (item.monthIndex - meanX) ** 2, 0)
  if (!denominator) return null

  const slope = observations.reduce(
    (sum, item) => sum + (item.monthIndex - meanX) * (item.risk - meanY),
    0,
  ) / denominator
  const intercept = meanY - slope * meanX
  const currentDate = new Date()
  const nextCalendarMonth = currentDate.getFullYear() * 12 + currentDate.getMonth() + 1
  const forecastMonth = Math.max(observations[observations.length - 1].monthIndex + 1, nextCalendarMonth)
  const observedRisk = new Map(observations.map((item) => [item.monthIndex, item.risk]))
  const chartData = []

  for (let monthIndex = observations[0].monthIndex; monthIndex <= forecastMonth; monthIndex += 1) {
    const date = new Date(Math.floor(monthIndex / 12), monthIndex % 12, 1)
    chartData.push({
      month: date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
      actualRisk: observedRisk.get(monthIndex) ?? null,
      modelRisk: Math.min(100, Math.max(0, Math.round(intercept + slope * monthIndex))),
    })
  }

  return {
    chartData,
    score: chartData[chartData.length - 1].modelRisk,
    month: chartData[chartData.length - 1].month,
    sampleCount: observations.length,
  }
}

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('monthly')
  const [filters, setFilters] = useState({ startDate: '', endDate: '', severity: '', status: '' })
  const { language } = useLanguageStore()
  const t = translations[language]

  useEffect(() => {
    setLoading(true)
    getAnalytics({ period, ...filters, ...(period === 'custom' ? {} : { startDate: undefined, endDate: undefined }) })
      .then((res) => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [period, filters])

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
  const riskForecast = buildRiskForecast(data?.monthlyTrend)

  const comparison = data?.periodComparison
  const comparisonMetrics = comparison
    ? [
        { label: t.inspections, key: 'inspectionCount', suffix: '' },
        { label: t.averageRisk, key: 'avgRisk', suffix: '' },
        { label: t.highRiskCount, key: 'highRiskCount', suffix: '' },
        { label: t.violationCount, key: 'violationCount', suffix: '' },
      ]
    : []

  const comparisonChartData = comparisonMetrics.map(({ label, key }) => ({
    name: label,
    current: comparison?.current?.[key] || 0,
    previous: comparison?.previous?.[key] || 0,
  }))

  const riskChartData = comparison
    ? [
        { name: t.inspections, value: comparison.current?.inspectionCount || 0, color: '#0f766e' },
        { name: t.highRiskCount, value: comparison.current?.highRiskCount || 0, color: '#e11d48' },
        { name: t.violationCount, value: comparison.current?.violationCount || 0, color: '#f59e0b' },
      ].filter((item) => item.value > 0)
    : []

  const totalInspections = trendData.reduce((total, item) => total + item.inspections, 0)
  let completedInspections = 0
  const burndownData = trendData.map((item) => {
    completedInspections += item.inspections
    return {
      name: item.name,
      remaining: Math.max(totalInspections - completedInspections, 0),
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{t.analytics}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t.insightSubtitle}</p>
      </div>

      <section className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="font-semibold">{t.periodComparison}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">{t.periodComparisonSubtitle}</p>
          </div>
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-1" role="tablist">
            {[
              ['weekly', t.weekly],
              ['monthly', t.monthly],
              ['yearly', t.yearly],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={period === value}
                onClick={() => setPeriod(value)}
                className={`px-3 py-1.5 text-sm rounded-md transition ${period === value ? 'bg-primary-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm"><span className="mb-1 block text-slate-600 dark:text-slate-300">From</span><input type="date" value={filters.startDate} onChange={(event) => { setPeriod('custom'); setFilters((current) => ({ ...current, startDate: event.target.value })) }} className="input-field w-full" /></label>
          <label className="text-sm"><span className="mb-1 block text-slate-600 dark:text-slate-300">To</span><input type="date" value={filters.endDate} onChange={(event) => { setPeriod('custom'); setFilters((current) => ({ ...current, endDate: event.target.value })) }} className="input-field w-full" /></label>
          <label className="text-sm"><span className="mb-1 block text-slate-600 dark:text-slate-300">Severity</span><select value={filters.severity} onChange={(event) => setFilters((current) => ({ ...current, severity: event.target.value }))} className="input-field w-full"><option value="">All severities</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label>
          <label className="text-sm"><span className="mb-1 block text-slate-600 dark:text-slate-300">Status</span><select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="input-field w-full"><option value="">All statuses</option><option value="open">Open</option><option value="in_progress">In progress</option><option value="closed">Closed</option></select></label>
        </div>
        {!comparison ? (
          <p className="text-slate-400 text-sm">{t.noComparisonData}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {comparisonMetrics.map(({ label, key }) => {
              const current = comparison.current?.[key] || 0
              const previous = comparison.previous?.[key] || 0
              const change = getPercentChange(current, previous)
              const isPositive = change > 0
              const isNegative = change < 0
              return (
                <div key={key} className="card border-t-4 border-t-[#ff6f00] p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-300">{label}</p>
                  <div className="flex items-end justify-between gap-3 mt-2">
                    <p className="text-2xl font-bold">{current}</p>
                    <span className={`rounded-full bg-emerald-50 px-2 py-1 text-sm font-semibold ${isPositive ? 'text-emerald-700' : isNegative ? 'text-rose-600' : 'text-slate-500'}`}>
                      {change > 0 ? '+' : ''}{change}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {t.previousPeriod}: {previous}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </section>

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
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a' }} labelStyle={{ color: '#0f172a' }} itemStyle={{ color: '#0f172a' }} />
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
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a' }} labelStyle={{ color: '#0f172a' }} itemStyle={{ color: '#0f172a' }} />
                <Area type="monotone" dataKey="inspections" stroke="#0d9488" fill="#0d9488" fillOpacity={0.16} strokeWidth={3} name="Inspections" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <section className="card p-5">
        <div className="mb-4">
          <h2 className="font-semibold">ML risk forecast (prototype)</h2>
          <p className="text-sm text-slate-500">Linear regression on monthly average inspection risk</p>
        </div>
        {!riskForecast ? (
          <p className="text-sm text-slate-400">At least three months with inspection data are needed to estimate a trend.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={riskForecast.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="actualRisk" stroke="#0f766e" strokeWidth={2} dot={{ r: 3 }} connectNulls name="Observed risk" />
                <Line type="linear" dataKey="modelRisk" stroke="#e11d48" strokeWidth={2} strokeDasharray="6 4" dot={false} name="Model trend and estimate" />
              </LineChart>
            </ResponsiveContainer>
            <aside className="border-t border-slate-200 pt-4 dark:border-slate-700 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
              <p className="text-sm text-slate-500">Estimated average risk</p>
              <p className="mt-1 text-3xl font-bold">{riskForecast.score}<span className="ml-1 text-base font-normal text-slate-400">/100</span></p>
              <p className="mt-1 text-sm text-slate-500">{riskForecast.month} · next estimate</p>
              <p className="mt-3 text-xs text-slate-500">Based on {riskForecast.sampleCount} observed months. Trend-only estimate, not a safety decision.</p>
            </aside>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card p-5 xl:col-span-2">
          <h2 className="font-semibold mb-4">Period comparison bar chart</h2>
          {!comparisonChartData.length ? (
            <p className="text-slate-400 text-sm">{t.noComparisonData}</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={comparisonChartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-12} textAnchor="end" height={55} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="current" fill="#0f766e" name={t.currentPeriod} radius={[4, 4, 0, 0]} />
                <Bar dataKey="previous" fill="#94a3b8" name={t.previousPeriod} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-semibold mb-4">Current period composition</h2>
          {!riskChartData.length ? (
            <p className="text-slate-400 text-sm">{t.noComparisonData}</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={riskChartData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
                  {riskChartData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={42} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold mb-1">Inspection burndown</h2>
        <p className="text-sm text-slate-500 mb-4">Remaining inspection workload across the reporting trend</p>
        {!burndownData.length ? (
          <p className="text-slate-400 text-sm">{t.noDataAvailable}</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={burndownData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="remaining" stroke="#e11d48" strokeWidth={3} dot={{ r: 4 }} name="Remaining" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* High Risk List */}
      <div className="card p-5">
        <h2 className="font-semibold mb-4">{t.highRiskInspections}</h2>
        <TableScrollContainer>
          <table className="mobile-readable-table text-sm">
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
        </TableScrollContainer>
      </div>
    </div>
  )
}