import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getInspection, updateInspection, closeViolation } from '../services/api'
import { format } from 'date-fns'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'

const severityBadge = {
  low: 'badge-low',
  medium: 'badge-medium',
  high: 'badge-high',
  critical: 'badge-critical',
}

export default function InspectionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [inspection, setInspection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchInspection()
  }, [id])

  const fetchInspection = async () => {
    try {
      const res = await getInspection(id)
      setInspection(res.data.data)
    } catch (error) {
      toast.error('Inspection not found')
      navigate('/inspections')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (status) => {
    setUpdating(true)
    try {
      const res = await updateInspection(id, { status })
      setInspection(res.data.data)
      toast.success(`Status updated to ${status}`)
    } catch (error) {
      toast.error('Failed to update')
    } finally {
      setUpdating(false)
    }
  }

  const handleCloseViolation = async (violationId) => {
    try {
      const res = await closeViolation(id, violationId)
      setInspection(res.data.data)
      toast.success('Violation closed')
    } catch (error) {
      toast.error('Failed to close violation')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!inspection) return null

  const coords = inspection.location?.coordinates
    ? [inspection.location.coordinates[1], inspection.location.coordinates[0]]
    : null

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 mt-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold">{inspection.title}</h1>
            <span className={`badge ${severityBadge[inspection.severity]}`}>
              {inspection.severity}
            </span>
          </div>
          <p className="text-sm text-slate-500">
            {inspection.mineId?.name} • {format(new Date(inspection.createdAt), 'dd MMM yyyy, HH:mm')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-center px-4 py-2 rounded-lg ${
            inspection.riskScore >= 80 ? 'bg-red-100 text-red-700 dark:bg-red-900/30' :
            inspection.riskScore >= 60 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30' :
            inspection.riskScore >= 35 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' :
            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
          }`}>
            <p className="text-xs font-medium">Risk Score</p>
            <p className="text-2xl font-bold">{inspection.riskScore}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold">Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Type</p>
                <p className="font-medium capitalize">{inspection.type}</p>
              </div>
              <div>
                <p className="text-slate-500">Status</p>
                <p className="font-medium capitalize">{inspection.status?.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-slate-500">Inspector</p>
                <p className="font-medium">{inspection.inspectorId?.name || '—'}</p>
              </div>
              <div>
                <p className="text-slate-500">Mine Code</p>
                <p className="font-medium">{inspection.mineId?.code || '—'}</p>
              </div>
            </div>
            {inspection.description && (
              <div>
                <p className="text-slate-500 text-sm">Description</p>
                <p className="mt-1">{inspection.description}</p>
              </div>
            )}
            {inspection.observations && (
              <div>
                <p className="text-slate-500 text-sm">Observations</p>
                <p className="mt-1">{inspection.observations}</p>
              </div>
            )}
          </div>

          {/* Violations */}
          <div className="card p-5">
            <h2 className="font-semibold mb-4">
              Violations ({inspection.violations?.length || 0})
            </h2>
            {(!inspection.violations || inspection.violations.length === 0) ? (
              <p className="text-slate-400 text-sm">No violations recorded</p>
            ) : (
              <div className="space-y-3">
                {inspection.violations.map((v) => (
                  <div key={v._id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{v.description}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {v.category} • <span className={`badge ${severityBadge[v.severity]}`}>{v.severity}</span>
                        </p>
                        {v.correctiveAction && (
                          <p className="text-sm mt-2 text-slate-600 dark:text-slate-300">
                            <strong>Action:</strong> {v.correctiveAction}
                          </p>
                        )}
                      </div>
                      {v.status === 'open' ? (
                        <button
                          onClick={() => handleCloseViolation(v._id)}
                          className="btn-secondary text-xs flex items-center gap-1 shrink-0"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Close
                        </button>
                      ) : (
                        <span className="badge badge-low">Closed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="card p-5 space-y-3">
            <h2 className="font-semibold">Actions</h2>
            {inspection.status !== 'closed' && (
              <>
                <button
                  onClick={() => handleStatusChange('in_progress')}
                  disabled={updating || inspection.status === 'in_progress'}
                  className="btn-secondary w-full text-sm"
                >
                  Mark In Progress
                </button>
                <button
                  onClick={() => handleStatusChange('escalated')}
                  disabled={updating}
                  className="btn-secondary w-full text-sm text-orange-600"
                >
                  Escalate
                </button>
                <button
                  onClick={() => handleStatusChange('closed')}
                  disabled={updating}
                  className="btn-primary w-full text-sm"
                >
                  Close Inspection
                </button>
              </>
            )}
            {inspection.status === 'closed' && (
              <p className="text-sm text-emerald-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Inspection Closed
              </p>
            )}
          </div>

          {/* Map */}
          {coords && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary-600" />
                <h2 className="font-semibold">Location</h2>
              </div>
              <div className="h-48 rounded-lg overflow-hidden">
                <MapContainer center={coords} zoom={14} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={coords} />
                </MapContainer>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {coords[0].toFixed(5)}, {coords[1].toFixed(5)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}