import { useEffect, useRef, useState } from 'react'
import { createMine, getMines } from '../services/api'
import { Compass, MapPin, Navigation, Plus, X } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import '../utils/leafletAssets'
import { useLanguageStore } from '../store/themeStore'
import { translations } from '../i18n/translations'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const riskBadge = {
  low: 'badge-low',
  medium: 'badge-medium',
  high: 'badge-high',
  critical: 'badge-critical',
}

const riskLevels = ['low', 'medium', 'high', 'critical']

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
    visibility: 'private',
    disasterProne: false,
    disasterSeason: '',
  })
  const { language } = useLanguageStore()
  const t = translations[language]
  const user = useAuthStore((state) => state.user)
  const canCreateMine = !user || !user.role || ['admin', 'corporate', 'manager', 'officer', 'inspector', 'engineer', 'supervisor'].includes(user?.role) || (typeof navigator !== 'undefined' && !navigator.onLine)
  const formRef = useRef(null)
  const [geoLocating, setGeoLocating] = useState(false)

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

  useEffect(() => {
    if (showCreateForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [showCreateForm])

  const handleGetCurrentLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    setGeoLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }))
        setGeoLocating(false)
        toast.success('GPS coordinates retrieved!')
      },
      (err) => {
        setGeoLocating(false)
        toast.error('Could not get GPS position: ' + (err.message || 'Permission denied'))
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const handleSetDefaultLocation = () => {
    setForm((prev) => ({
      ...prev,
      latitude: '24.120000',
      longitude: '82.450000',
      address: prev.address || 'Singrauli Coalfield, MP',
    }))
    toast.success('Applied Singrauli regional coordinates')
  }

  const handleCreateMine = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFormError('')

    const lat = parseFloat(form.latitude)
    const lng = parseFloat(form.longitude)
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setFormError('Please enter valid numeric latitude (-90 to 90) and longitude (-180 to 180).')
      setSaving(false)
      return
    }

    try {
      const res = await createMine({
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        subsidiary: form.subsidiary.trim(),
        coordinates: [lng, lat],
        address: form.address?.trim() || '',
        status: form.status,
        visibility: form.visibility,
        disasterProne: Boolean(form.disasterProne),
        disasterSeason: form.disasterSeason?.trim() || '',
      })
      const createdMine = res?.data?.data
      if (createdMine) {
        setMines((current) => [createdMine, ...current])
        setSelectedMineId(createdMine._id)
      }
      toast.success('Mine saved successfully!')
      setShowCreateForm(false)
      setForm({
        name: '',
        code: '',
        subsidiary: '',
        latitude: '',
        longitude: '',
        address: '',
        status: 'undiscovered',
        visibility: 'private',
        disasterProne: false,
        disasterSeason: '',
      })
    } catch (error) {
      setFormError(error.response?.data?.message || 'Unable to add mine. Please check all fields.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{t.minesTitle}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.minesSubtitle}</p>
          </div>
          {canCreateMine && (
            <button
              type="button"
              onClick={() => setShowCreateForm((visible) => !visible)}
              className="btn-primary w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 shadow-sm active:scale-95 transition"
            >
              {showCreateForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showCreateForm ? 'Cancel' : 'Add Mine'}
            </button>
          )}
        </div>
      </div>

      {showCreateForm && canCreateMine && (
        <form 
          ref={formRef} 
          onSubmit={handleCreateMine} 
          className="card border border-primary-200 dark:border-primary-900/50 bg-white p-5 text-slate-700 dark:bg-slate-900 dark:text-slate-100 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary-600" />
              Register New Mine Site
            </h2>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="mine-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mine Name *
              </label>
              <input 
                id="mine-name"
                required 
                placeholder="e.g. Singrauli Central Block"
                value={form.name} 
                onChange={(event) => setForm({ ...form, name: event.target.value })} 
                className="input-field w-full min-h-[44px] text-base sm:text-sm" 
              />
            </div>
            <div>
              <label htmlFor="mine-code" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mine Code *
              </label>
              <input 
                id="mine-code"
                required 
                placeholder="e.g. NCL-JYT-01"
                value={form.code} 
                onChange={(event) => setForm({ ...form, code: event.target.value })} 
                className="input-field w-full min-h-[44px] text-base sm:text-sm uppercase" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="mine-subsidiary" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subsidiary / Division *
              </label>
              <input 
                id="mine-subsidiary"
                required 
                placeholder="e.g. NCL / SECL / ECL"
                value={form.subsidiary} 
                onChange={(event) => setForm({ ...form, subsidiary: event.target.value })} 
                className="input-field w-full min-h-[44px] text-base sm:text-sm" 
              />
            </div>
            <div>
              <label htmlFor="mine-status" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select 
                id="mine-status"
                value={form.status} 
                onChange={(event) => setForm({ ...form, status: event.target.value })} 
                className="input-field w-full min-h-[44px] text-base sm:text-sm"
              >
                <option value="undiscovered">Undiscovered</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="under_maintenance">Under maintenance</option>
              </select>
            </div>
            <div>
              <label htmlFor="mine-visibility" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Visibility
              </label>
              <select 
                id="mine-visibility"
                value={form.visibility} 
                onChange={(event) => setForm({ ...form, visibility: event.target.value })} 
                className="input-field w-full min-h-[44px] text-base sm:text-sm"
              >
                <option value="private">Private (admin and corporate)</option>
                <option value="public">Public (all logged-in roles)</option>
              </select>
            </div>
          </div>

          {/* Coordinates section with quick GPS helpers */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                GPS Location Coordinates *
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={geoLocating}
                  className="btn-secondary text-xs min-h-[36px] inline-flex items-center gap-1.5 px-2.5 py-1"
                >
                  <Navigation className={`h-3.5 w-3.5 ${geoLocating ? 'animate-spin' : ''}`} />
                  {geoLocating ? 'Detecting...' : 'Current GPS'}
                </button>
                <button
                  type="button"
                  onClick={handleSetDefaultLocation}
                  className="btn-secondary text-xs min-h-[36px] inline-flex items-center gap-1.5 px-2.5 py-1"
                >
                  <Compass className="h-3.5 w-3.5" />
                  Default (Singrauli)
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="mine-latitude" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Latitude (-90 to 90) *
                </label>
                <input 
                  id="mine-latitude"
                  required 
                  type="number" 
                  step="any" 
                  min="-90" 
                  max="90" 
                  placeholder="e.g. 24.120000"
                  value={form.latitude} 
                  onChange={(event) => setForm({ ...form, latitude: event.target.value })} 
                  className="input-field w-full min-h-[44px] text-base sm:text-sm" 
                />
              </div>
              <div>
                <label htmlFor="mine-longitude" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Longitude (-180 to 180) *
                </label>
                <input 
                  id="mine-longitude"
                  required 
                  type="number" 
                  step="any" 
                  min="-180" 
                  max="180" 
                  placeholder="e.g. 82.450000"
                  value={form.longitude} 
                  onChange={(event) => setForm({ ...form, longitude: event.target.value })} 
                  className="input-field w-full min-h-[44px] text-base sm:text-sm" 
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="mine-address" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Address / Operational Landmark
            </label>
            <input 
              id="mine-address"
              placeholder="e.g. Post Box 21, Singrauli District, MP"
              value={form.address} 
              onChange={(event) => setForm({ ...form, address: event.target.value })} 
              className="input-field w-full min-h-[44px] text-base sm:text-sm" 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <label className="flex items-center gap-3 text-sm font-medium cursor-pointer p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
              <input 
                type="checkbox" 
                checked={form.disasterProne} 
                onChange={(event) => setForm({ ...form, disasterProne: event.target.checked })} 
                className="h-5 w-5 accent-primary-600 rounded" 
              />
              <span className="text-slate-800 dark:text-slate-200 font-medium">Disaster-prone site</span>
            </label>
            <div>
              <label htmlFor="mine-season" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Peak Disaster Period
              </label>
              <input 
                id="mine-season"
                value={form.disasterSeason} 
                onChange={(event) => setForm({ ...form, disasterSeason: event.target.value })} 
                placeholder="e.g. Jul-Sep (monsoon flooding)" 
                className="input-field w-full min-h-[44px] text-base sm:text-sm" 
              />
            </div>
          </div>

          {formError && (
            <p role="alert" className="text-sm font-medium text-rose-600 bg-rose-50 dark:bg-rose-950/30 p-3 rounded-lg border border-rose-200 dark:border-rose-900">
              {formError}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button 
              type="button" 
              onClick={() => setShowCreateForm(false)} 
              className="btn-secondary w-full sm:w-auto min-h-[44px]"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving} 
              className="btn-primary w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? 'Adding Mine...' : 'Add Mine'}
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
                    {mine.code} • {mine.status?.replaceAll('_', ' ')} • {mine.visibility || 'public'}
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
              <p className="mb-3 text-xs font-medium capitalize text-slate-500">{mine.visibility || 'public'}</p>
              <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span>Risk profile</span>
                  <span className="normal-case">Current: {mine.riskLevel || 'low'}</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {riskLevels.map((level) => (
                    <span key={level} className={`rounded px-1 py-1 text-center text-[10px] font-semibold capitalize ${riskBadge[level]} ${mine.riskLevel === level ? 'ring-2 ring-slate-500 ring-offset-1 dark:ring-offset-slate-950' : 'opacity-60'}`}>
                      {level}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-slate-200 p-2 dark:border-slate-800">
                  <p className="text-slate-500">Disaster-prone site</p>
                  <p className={`mt-1 font-semibold ${mine.disasterProne ? 'text-rose-600' : 'text-emerald-600'}`}>{mine.disasterProne ? 'Yes' : 'No'}</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-2 dark:border-slate-800">
                  <p className="text-slate-500">Peak occurrence</p>
                  <p className="mt-1 font-semibold text-slate-700 dark:text-slate-200">{mine.disasterSeason || 'Not specified'}</p>
                </div>
              </div>
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
