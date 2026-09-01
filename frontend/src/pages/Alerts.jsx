import { useEffect, useState } from 'react'
import { getAlerts, markAlertRead, markAllAlertsRead } from '../services/api'
import { Bell, CheckCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

const severityColor = {
  info: 'border-blue-500 bg-blue-50 dark:bg-blue-900/10',
  warning: 'border-amber-500 bg-amber-50 dark:bg-amber-900/10',
  critical: 'border-red-500 bg-red-50 dark:bg-red-900/10',
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAlerts = () => {
    getAlerts()
      .then((res) => setAlerts(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  const handleMarkRead = async (id) => {
    await markAlertRead(id)
    fetchAlerts()
  }

  const handleMarkAll = async () => {
    await markAllAlertsRead()
    toast.success('All alerts marked as read')
    fetchAlerts()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alerts</h1>
          <p className="text-sm text-slate-500 mt-1">System notifications & escalations</p>
        </div>
        <button onClick={handleMarkAll} className="btn-secondary flex items-center gap-2 text-sm">
          <CheckCheck className="w-4 h-4" /> Mark all read
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-slate-400">Loading...</p>
        ) : alerts.length === 0 ? (
          <div className="card p-12 text-center text-slate-400">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No alerts</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert._id}
              className={`card p-4 border-l-4 ${severityColor[alert.severity] || ''} ${
                alert.isRead ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{alert.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{alert.message}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                    {alert.mineId?.name && ` • ${alert.mineId.name}`}
                  </p>
                </div>
                {!alert.isRead && (
                  <button
                    onClick={() => handleMarkRead(alert._id)}
                    className="text-xs text-primary-600 hover:underline shrink-0"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}