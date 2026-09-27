import { useEffect, useState } from 'react'
import { createMine, getMines } from '../services/api'
import { MapPin, Plus, X } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import '../utils/leafletAssets'
import { useLanguageStore } from '../store/themeStore'
import { translations } from '../i18n/translations'
import useAuthStore from '../store/authStore'

const riskBadge = {
  low: 'badge-low',
  medium: 'badge-medium',
  high: 'badge-high',
  critical: 'badge-critical',
}

export default function Mines() {
  const [mines, setMines] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMineId, setSelectedMineId] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    name: '',
    code: '',
    subsidiary: '',
    latitude: '',
    longitude: '',
    address: '',
    status: 'undiscovered',
  })
  const { language } = useLanguageStore()
  const t = translations[language]
  const user = useAuthStore((state) => state.user)
  const canCreateMine = ['admin', 'corporate'].includes(user?.role)

  useEffect(() => {
    getMines()
      .then((res) => setMines(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const center = mines.length > 0 && mines[0].location?.coordinates
    ? [mines[0].location.coordinates[1], mines[0].location.coordinates[0]]
    : [24.12, 82.45]
  const selectedMine = mines.find((mine) => mine._id === selectedMineId)

  const handleCreateMine = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFormError('')

    try {
      const { data } = await createMine({
        name: form.name,
        code: form.code,
        subsidiary: form.subsidiary,
        coordinates: [Number(form.longitude), Number(form.latitude)],
        address: form.address,
        status: form.status,
      })
      setMines((current) => [data.data, ...current])
      setSelectedMineId(data.data._id)
      setShowCreateForm(false)
      setForm({
        name: '',
        code: '',
        subsidiary: '',
        latitude: '',
        longitude: '',
        address: '',
        status: 'undiscovered',
      })
    } catch (error) {
      setFormError(error.response?.data?.message || 'Unable to add mine. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t.minesTitle}</h1>
            <p className="text-sm text-slate-500 mt-1">{t.minesSubtitle}</p>
          </div>
          {canCreateMine && (
            <button
              type="button"
              onClick={() => setShowCreateForm((visible) => !visible)}
              className="btn-primary inline-flex shrink-0 items-center gap-2"
            >
              {showCreateForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showCreateForm ? 'Cancel' : 'Add Mine'}
            </button>
          )}
        </div>
      </div>

      {showCreateForm && canCreateMine && (
        <form onSubmit={handleCreateMine} className="card grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          <label className="text-sm font-medium">
            Mine name
            <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="input mt-1 w-full" />
          </label>
          <label className="text-sm font-medium">
            Mine code
            <input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} className="input mt-1 w-full" />
          </label>
          <label className="text-sm font-medium">
            Subsidiary
            <input required value={form.subsidiary} onChange={(event) => setForm({ ...form, subsidiary: event.target.value })} className="input mt-1 w-full" />
          </label>
          <label className="text-sm font-medium">
            Status
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="input mt-1 w-full">
              <option value="undiscovered">Undiscovered</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="under_maintenance">Under maintenance</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            Latitude
            <input required type="number" step="any" min="-90" max="90" value={form.latitude} onChange={(event) => setForm({ ...form, latitude: event.target.value })} className="input mt-1 w-full" />
          </label>
          <label className="text-sm font-medium">
            Longitude
            <input required type="number" step="any" min="-180" max="180" value={form.longitude} onChange={(event) => setForm({ ...form, longitude: event.target.value })} className="input mt-1 w-full" />
          </label>
          <label className="text-sm font-medium md:col-span-2">
            Address
            <input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} className="input mt-1 w-full" />
          </label>
          {formError && <p role="alert" className="text-sm text-red-600 md:col-span-2">{formError}</p>}
          <div className="flex justify-end md:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? 'Adding...' : 'Add Mine'}
            </button>
          </div>
        </form>
      )}

      {/* Map */}
      <div className="card p-4">
        <div className="h-72 rounded-lg overflow-hidden">
          <MapContainer center={center} zoom={6} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <SelectedMineFocus mine={selectedMine} />
            {mines.map((mine) => (
              mine.location?.coordinates && (
                <Marker
                  key={mine._id}
                  position={[mine.location.coordinates[1], mine.location.coordinates[0]]}
                  eventHandlers={{ click: () => setSelectedMineId(mine._id) }}
                >
                  <Popup>
                    <strong>{mine.name}</strong><br />
                    {mine.code} • {mine.status?.replaceAll('_', ' ')} • Score: {mine.complianceScore}%
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-slate-400">{t.loading}</p>
        ) : (
          mines.map((mine) => (
            <button
              type="button"
              key={mine._id}
              onClick={() => setSelectedMineId(mine._id)}
              className={`card w-full p-5 text-left transition hover:-translate-y-0.5 hover:shadow-card-hover focus:outline-none focus:ring-2 focus:ring-primary-500 ${selectedMineId === mine._id ? 'ring-2 ring-primary-600' : ''}`}
              aria-pressed={selectedMineId === mine._id}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <h3 className="font-semibold">{mine.name}</h3>
                </div>
                {mine.status !== 'undiscovered' && (
                  <span className={`badge ${riskBadge[mine.riskLevel]}`}>{mine.riskLevel}</span>
                )}
              </div>
              <p className="text-sm text-slate-500 mb-2">{mine.code} • {mine.subsidiary}</p>
              <p className="mb-3 text-xs font-medium uppercase text-slate-500">{mine.status?.replaceAll('_', ' ')}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{t.complianceScore}</span>
                <span className="font-bold text-lg">
                  {mine.status === 'undiscovered' ? 'N/A' : `${mine.complianceScore}%`}
                </span>
              </div>
              {mine.status !== 'undiscovered' && (
                <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      mine.complianceScore >= 80 ? 'bg-emerald-500' :
                      mine.complianceScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${mine.complianceScore}%` }}
                  />
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )
}

function SelectedMineFocus({ mine }) {
  const map = useMap()
  useEffect(() => {
    const coordinates = mine?.location?.coordinates
    if (Array.isArray(coordinates) && coordinates.length >= 2) {
      map.flyTo([coordinates[1], coordinates[0]], 12, { duration: 0.6 })
    }
  }, [map, mine])
  return null
}
