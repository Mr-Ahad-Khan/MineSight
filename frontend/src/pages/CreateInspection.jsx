import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Loader2, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { createInspection, getMines } from '../services/api'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { useLanguageStore } from '../store/themeStore'
import { translations } from '../i18n/translations'

// Fix leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng])
    },
  })
  return position ? <Marker position={position} /> : null
}

export default function CreateInspection() {
  const navigate = useNavigate()
  const { language } = useLanguageStore()
  const t = translations[language]
  const [mines, setMines] = useState([])
  const [loading, setLoading] = useState(false)
  const [position, setPosition] = useState([24.12, 82.45]) // Default Singrauli area

  const [form, setForm] = useState({
    mineId: '',
    type: 'scheduled',
    title: '',
    description: '',
    observations: '',
    severity: 'medium',
    violations: [],
  })

  const [violation, setViolation] = useState({
    description: '',
    category: 'safety',
    severity: 'medium',
    correctiveAction: '',
  })

  useEffect(() => {
    getMines().then((res) => setMines(res.data.data || [])).catch(console.error)
    
    // Try get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        () => {}
      )
    }
  }, [])

  const addViolation = () => {
    if (!violation.description) return toast.error(t.violationDescriptionRequired)
    setForm({
      ...form,
      violations: [...form.violations, { ...violation }],
    })
    setViolation({ description: '', category: 'safety', severity: 'medium', correctiveAction: '' })
  }

  const removeViolation = (index) => {
    setForm({
      ...form,
      violations: form.violations.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.mineId || !form.title) {
      return toast.error(t.mineAndTitle)
    }

    setLoading(true)
    try {
      const payload = {
        ...form,
        coordinates: [position[1], position[0]], // [lng, lat]
      }
      const res = await createInspection(payload)
      toast.success(`${t.inspectionCreated} ${res.data.data.riskScore}`)
      navigate(`/inspections/${res.data.data._id}`)
    } catch (error) {
      toast.error(error.response?.data?.message || t.failedToCreate)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.createInspectionTitle}</h1>
        <p className="text-sm text-slate-500 mt-1">{t.createInspectionSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold">{t.basicInformation}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">{t.mineRequired}</label>
              <select
                value={form.mineId}
                onChange={(e) => setForm({ ...form, mineId: e.target.value })}
                className="input-field"
                required
              >
                <option value="">{t.selectMine}</option>
                {mines.map((m) => (
                  <option key={m._id} value={m._id}>{m.name} ({m.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{t.inspectionType}</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="input-field"
              >
                <option value="scheduled">{t.scheduled}</option>
                <option value="safety">{t.safety}</option>
                <option value="environment">{t.environment}</option>
                <option value="surprise">{t.surprise}</option>
                <option value="incident">{t.incident}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">{t.titleRequired}</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field"
              placeholder={t.titlePlaceholder}
              required
            />
          </div>

          <div>
            <label className="label">{t.description}</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field"
              rows={2}
              placeholder={t.descriptionPlaceholder}
            />
          </div>

          <div>
            <label className="label">{t.observations}</label>
            <textarea
              value={form.observations}
              onChange={(e) => setForm({ ...form, observations: e.target.value })}
              className="input-field"
              rows={3}
              placeholder={t.observationsPlaceholder}
            />
          </div>

          <div>
            <label className="label">{t.severity}</label>
            <select
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
              className="input-field w-auto"
            >
              <option value="low">{t.low}</option>
              <option value="medium">{t.medium}</option>
              <option value="high">{t.high}</option>
              <option value="critical">{t.criticalLabel}</option>
            </select>
          </div>
        </div>

        {/* Geo Location */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold">{t.geoLocation}</h2>
          </div>
          <p className="text-sm text-slate-500">{t.clickMap}</p>
          
          <div className="h-64 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />
              <LocationPicker position={position} setPosition={setPosition} />
            </MapContainer>
          </div>
          <p className="text-xs text-slate-500">
            {t.coordinates}: {position[0].toFixed(5)}, {position[1].toFixed(5)}
          </p>
        </div>

        {/* Violations */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold">{t.violationsFound}</h2>
          
          {form.violations.length > 0 && (
            <div className="space-y-2">
              {form.violations.map((v, i) => (
                <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div>
                    <p className="text-sm font-medium">{v.description}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {v.category} • {v.severity}
                    </p>
                  </div>
                  <button type="button" onClick={() => removeViolation(i)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
            <input
              type="text"
              value={violation.description}
              onChange={(e) => setViolation({ ...violation, description: e.target.value })}
              className="input-field md:col-span-2"
              placeholder="Violation description"
            />
            <select
              value={violation.category}
              onChange={(e) => setViolation({ ...violation, category: e.target.value })}
              className="input-field"
            >
              <option value="safety">Safety</option>
              <option value="environment">Environment</option>
              <option value="production">Production</option>
              <option value="labour">Labour</option>
              <option value="other">Other</option>
            </select>
            <select
              value={violation.severity}
              onChange={(e) => setViolation({ ...violation, severity: e.target.value })}
              className="input-field"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <input
              type="text"
              value={violation.correctiveAction}
              onChange={(e) => setViolation({ ...violation, correctiveAction: e.target.value })}
              className="input-field md:col-span-2"
              placeholder="Corrective action required"
            />
            <button type="button" onClick={addViolation} className="btn-secondary flex items-center gap-2 md:col-span-2">
              <Plus className="w-4 h-4" /> Add Violation
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Creating...' : 'Create Inspection'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}