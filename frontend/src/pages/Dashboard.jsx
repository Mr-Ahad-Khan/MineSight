import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ClipboardList, ShieldAlert, AlertTriangle, Bell, 
  TrendingUp, Building2, Users, ArrowRight
} from 'lucide-react'
import { getDashboardSummary, getAnalytics } from '../services/api'
import StatCard from '../components/dashboard/StatCard'
import RiskDistribution from '../components/dashboard/RiskDistribution'
import RecentAlerts from '../components/dashboard/RecentAlerts'
import HighRiskList from '../components/dashboard/HighRiskList'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, analyticsRes] = await Promise.all([
          getDashboardSummary(),
          getAnalytics()
        ])
        setSummary(summaryRes.data.data)
        setAnalytics(analyticsRes.data.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time governance & compliance overview</p>
        </div>
        <Link to="/inspections/new" className="btn-primary inline-flex items-center gap-2 self-start">
          <ClipboardList className="w-4 h-4" />
          New Inspection
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Mines"
          value={summary?.totalMines || 0}
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="Open Inspections"
          value={summary?.openInspections || 0}
          icon={ClipboardList}
          color="amber"
          subtitle={`${summary?.criticalInspections || 0} critical`}
        />
        <StatCard
          title="Overdue Compliances"
          value={summary?.overdueCompliances || 0}
          icon={ShieldAlert}
          color="red"
        />
        <StatCard
          title="Avg Compliance Score"
          value={`${summary?.avgComplianceScore || 0}%`}
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Risk Distribution */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Mine Risk Distribution</h2>
              <Link to="/analytics" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                View Analytics <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <RiskDistribution data={summary?.riskDistribution} />
          </div>

          {/* High Risk Inspections */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">High Risk Inspections</h2>
              <Link to="/inspections?severity=high" className="text-sm text-primary-600 hover:underline">
                View all
              </Link>
            </div>
            <HighRiskList inspections={analytics?.highRiskInspections || []} />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="card p-5">
            <h2 className="font-semibold text-lg mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary-600" />
                  <span className="text-sm">Active Contractors</span>
                </div>
                <span className="font-semibold">{summary?.activeContractors || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-amber-500" />
                  <span className="text-sm">Unread Alerts</span>
                </div>
                <span className="font-semibold">{summary?.unreadAlerts || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="text-sm">Critical Inspections</span>
                </div>
                <span className="font-semibold">{summary?.criticalInspections || 0}</span>
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Recent Alerts</h2>
              <Link to="/alerts" className="text-sm text-primary-600 hover:underline">
                View all
              </Link>
            </div>
            <RecentAlerts />
          </div>
        </div>
      </div>
    </div>
  )
}