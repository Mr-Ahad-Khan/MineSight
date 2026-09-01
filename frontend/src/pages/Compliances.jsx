import { useEffect, useState } from 'react'
import { getCompliances, getOverdueCompliances } from '../services/api'
import { format } from 'date-fns'
import { ShieldCheck, AlertCircle } from 'lucide-react'

const statusBadge = {
  compliant: 'badge-low',
  pending: 'badge-medium',
  non_compliant: 'badge-high',
  overdue: 'badge-critical',
}

export default function Compliances() {
  const [compliances, setCompliances] = useState([])
  const [overdue, setOverdue] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getCompliances(), getOverdueCompliances()])
      .then(([cRes, oRes]) => {
        setCompliances(cRes.data.data || [])
        setOverdue(oRes.data.data || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Compliances</h1>
        <p className="text-sm text-slate-500 mt-1">Statutory compliance tracking</p>
      </div>

      {overdue.length > 0 && (
        <div className="card p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{overdue.length} Overdue Compliance(s)</span>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Mine</th>
                <th className="px-4 py-3 font-medium">Due Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan="5" className="px-4 py-12 text-center text-slate-400">Loading...</td></tr>
              ) : compliances.length === 0 ? (
                <tr><td colSpan="5" className="px-4 py-12 text-center text-slate-400">No compliances found</td></tr>
              ) : (
                compliances.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-medium">{c.title}</td>
                    <td className="px-4 py-3 capitalize">{c.category}</td>
                    <td className="px-4 py-3">{c.mineId?.name || '—'}</td>
                    <td className="px-4 py-3">{format(new Date(c.dueDate), 'dd MMM yyyy')}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${statusBadge[c.status]}`}>{c.status?.replace('_', ' ')}</span>
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