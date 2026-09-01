import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter } from 'lucide-react'
import { getInspections } from '../services/api'
import { format } from 'date-fns'

const statusBadge = {
  open: 'badge-medium',
  in_progress: 'badge-high',
  closed: 'badge-low',
  escalated: 'badge-critical',
}

const severityBadge = {
  low: 'badge-low',
  medium: 'badge-medium',
  high: 'badge-high',
  critical: 'badge-critical',
}

export default function Inspections() {
  const [inspections, setInspections] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', severity: '' })

  useEffect(() => {
    fetchInspections()
  }, [filters])

  const fetchInspections = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.status) params.status = filters.status
      if (filters.severity) params.severity = filters.severity
      const res = await getInspections(params)
      setInspections(res.data.data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inspections</h1>
          <p className="text-sm text-slate-500 mt-1">Manage field inspections & violations</p>
        </div>
        <Link to="/inspections/new" className="btn-primary inline-flex items-center gap-2 self-start">
          <Plus className="w-4 h-4" />
          New Inspection
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="input-field w-auto"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="closed">Closed</option>
          <option value="escalated">Escalated</option>
        </select>
        <select
          value={filters.severity}
          onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
          className="input-field w-auto"
        >
          <option value="">All Severity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Title</th>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Mine</th>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Severity</th>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Risk</th>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Status</th>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : inspections.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-slate-400">
                    No inspections found
                  </td>
                </tr>
              ) : (
                inspections.map((insp) => (
                  <tr key={insp._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <Link to={`/inspections/${insp._id}`} className="font-medium text-primary-600 hover:underline">
                        {insp.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {insp.mineId?.name || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${severityBadge[insp.severity]}`}>
                        {insp.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {insp.riskScore}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${statusBadge[insp.status]}`}>
                        {insp.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {format(new Date(insp.createdAt), 'dd MMM yyyy')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}