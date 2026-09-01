export default function RiskDistribution({ data }) {
  if (!data) return null

  const total = (data.low || 0) + (data.medium || 0) + (data.high || 0) + (data.critical || 0) || 1

  const items = [
    { label: 'Low', value: data.low || 0, color: 'bg-emerald-500', text: 'text-emerald-600' },
    { label: 'Medium', value: data.medium || 0, color: 'bg-amber-500', text: 'text-amber-600' },
    { label: 'High', value: data.high || 0, color: 'bg-orange-500', text: 'text-orange-600' },
    { label: 'Critical', value: data.critical || 0, color: 'bg-red-500', text: 'text-red-600' },
  ]

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
        {items.map((item) => (
          item.value > 0 && (
            <div
              key={item.label}
              className={`${item.color} transition-all`}
              style={{ width: `${(item.value / total) * 100}%` }}
            />
          )
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
            <div>
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className={`text-sm font-semibold ${item.text}`}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}