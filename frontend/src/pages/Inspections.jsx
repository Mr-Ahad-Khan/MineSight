import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mic, Plus, Trash2 } from 'lucide-react'
import { deleteInspection, getInspections, getMediaUrl } from '../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { useLanguageStore } from '../store/themeStore'
import { translations } from '../i18n/translations'

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
  const { language } = useLanguageStore()
  const t = translations[language]

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

  const handleDeleteInspection = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inspection?')) return

    try {
      await deleteInspection(id)
      toast.success('Inspection deleted successfully')
      setInspections((prev) => prev.filter((inspection) => inspection._id !== id))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete inspection')
    }
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f3eadb] px-4 pb-10 pt-3 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-4 flex items-center justify-between gap-4 border-b border-[#c9b69d] pb-4">
          <h1 className="text-[40px] font-medium tracking-[-0.05em] text-[#1b1b1b]">{t.inspections}</h1>

          <div className="flex items-center gap-3">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="min-w-[160px] appearance-none rounded-full border border-[#bca98e] bg-[#f8f4ed] px-4 py-2.5 pr-10 text-[16px] text-[#1f1f1f] outline-none focus:border-[#8a7156]"
            >
              <option value="">{t.allStatus}</option>
              <option value="open">{t.open}</option>
              <option value="in_progress">{t.inProgress}</option>
              <option value="closed">{t.closed}</option>
              <option value="escalated">{t.escalated}</option>
            </select>

            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              className="min-w-[160px] appearance-none rounded-full border border-[#bca98e] bg-[#f8f4ed] px-4 py-2.5 pr-10 text-[16px] text-[#1f1f1f] outline-none focus:border-[#8a7156]"
            >
              <option value="">{t.allSeverity}</option>
              <option value="low">{t.low}</option>
              <option value="medium">{t.medium}</option>
              <option value="high">{t.high}</option>
              <option value="critical">{t.criticalLabel}</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-[#d8c6a6] bg-[#f5efe8] shadow-[0_2px_8px_rgba(76,60,43,0.08)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-[15px] text-[#1d1d1d]">
              <thead className="bg-[#f1e8dc] text-left">
                <tr>
                  <th className="px-4 py-4 font-semibold text-[#1e1e1e]">{t.title}</th>
                  <th className="px-4 py-4 font-semibold text-[#1e1e1e]">Photos</th>
                  <th className="px-4 py-4 font-semibold text-[#1e1e1e]">{t.mine}</th>
                  <th className="px-4 py-4 font-semibold text-[#1e1e1e]">{t.severity}</th>
                  <th className="px-4 py-4 font-semibold text-[#1e1e1e]">{t.status}</th>
                  <th className="px-4 py-4 font-semibold text-[#1e1e1e]">{t.risk}</th>
                  <th className="px-4 py-4 font-semibold text-[#1e1e1e]">{t.date}</th>
                  <th className="px-4 py-4 font-semibold text-[#1e1e1e]">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-slate-400">
                      {t.loading}
                    </td>
                  </tr>
                ) : inspections.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-slate-400">
                      {t.noInspections}
                    </td>
                  </tr>
                ) : (
                  inspections.map((insp) => {
                    const audioUrl = getMediaUrl(insp.audio)

                    return (
                      <tr key={insp._id} className="border-t border-[#d7c8b0] bg-[#f7f3ed] hover:bg-[#f1eadf]">
                        <td className="px-4 py-4 align-middle">
                          <Link to={`/app/inspections/${insp._id}`} className="text-[18px] font-medium text-[#1f1f1f] hover:text-[#0d3f6d] hover:underline">
                            {insp.title}
                          </Link>
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <div className="flex items-center gap-3">
                            {audioUrl ? (
                              <div className="flex items-center gap-2 rounded-full bg-[#f0f1f3] px-2 py-1 text-[10px] font-medium text-[#3a3a3a]">
                                <Mic className="h-3 w-3 text-[#0d3f6d]" />
                                <audio controls src={audioUrl} className="h-8 w-28" />
                              </div>
                            ) : null}

                            {insp.photos?.length > 0 ? (
                              <div className="flex items-center gap-1">
                                {insp.photos.slice(0, 3).map((photo, idx) => (
                                  <img
                                    key={`${photo}-${idx}`}
                                    src={getMediaUrl(photo)}
                                    alt="Inspection preview"
                                    className="h-9 w-9 rounded-md border border-[#d9c7a7] object-cover shadow-sm transition-transform duration-200 hover:scale-110"
                                    onError={(event) => {
                                      event.currentTarget.style.display = 'none'
                                    }}
                                  />
                                ))}
                                {insp.photos.length > 3 ? (
                                  <span className="ml-1 rounded-md bg-[#ece4d5] px-1.5 py-0.5 text-[10px] font-medium text-[#4c433d]">
                                    +{insp.photos.length - 3}
                                  </span>
                                ) : null}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4 align-middle text-[#2d2d2d]">
                          {insp.mineId?.name || '—'}
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium capitalize ${severityBadge[insp.severity]}`}>
                            {insp.severity}
                          </span>
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium capitalize ${statusBadge[insp.status]}`}>
                            {insp.status?.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="px-4 py-4 align-middle text-center font-semibold text-[#1e1e1e]">
                          {insp.riskScore}
                        </td>

                        <td className="px-4 py-4 align-middle text-[#474747]">
                          {insp.createdAt ? format(new Date(insp.createdAt), 'dd MMM yyyy') : '—'}
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <button
                            type="button"
                            onClick={() => handleDeleteInspection(insp._id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end px-4 pb-4 pt-2">
            <Link
              to="/app/inspections/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0d3f6d] px-5 py-3 text-[15px] font-medium text-white shadow-[0_3px_10px_rgba(13,63,109,0.25)] transition hover:bg-[#0a3560]"
            >
              <Plus className="h-4 w-4" />
              {t.newInspection}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
