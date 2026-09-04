import { useEffect, useState } from 'react'
import { getMines } from '../services/api'
import { MapPin } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import '../utils/leafletAssets'
import { useLanguageStore } from '../store/themeStore'
import { translations } from '../i18n/translations'

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
  const { language } = useLanguageStore()
  const t = translations[language]

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.minesTitle}</h1>
        <p className="text-sm text-slate-500 mt-1">{t.minesSubtitle}</p>
      </div>

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
                    {mine.code} • Score: {mine.complianceScore}%
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
                <span className={`badge ${riskBadge[mine.riskLevel]}`}>{mine.riskLevel}</span>
              </div>
              <p className="text-sm text-slate-500 mb-2">{mine.code} • {mine.subsidiary}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{t.complianceScore}</span>
                <span className="font-bold text-lg">{mine.complianceScore}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    mine.complianceScore >= 80 ? 'bg-emerald-500' :
                    mine.complianceScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${mine.complianceScore}%` }}
                />
              </div>
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
