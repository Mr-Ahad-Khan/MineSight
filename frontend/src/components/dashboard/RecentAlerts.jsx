import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { getAlerts } from '../../services/api'
import { formatDistanceToNow } from 'date-fns'

const severityColor = {
  info: 'bg-blue-500',
  warning: 'bg-amber-500',
  critical: 'bg-red-500',
}

export default function RecentAlerts() {
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    getAlerts({ limit: 5 })
      .then((res) => setAlerts(res.data.data || []))
      .catch(console.error)
  }, [])

  if (alerts.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400">
        <Bell className="w-7 h-7 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No recent alerts</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div key={alert._id} className="dashboard-subcard flex gap-3">
          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${severityColor[alert.severity] || 'bg-slate-400'}`} />
          <div className="min-w-0">
            <p className="text-sm font-medium line-clamp-1">{alert.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}