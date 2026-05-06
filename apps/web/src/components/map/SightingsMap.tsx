'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { getSightings } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const markerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
  <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#16a34a" stroke="#fff" stroke-width="1.5"/>
  <circle cx="12" cy="12" r="5" fill="#fff"/>
</svg>`

const markerIcon = L.divIcon({
  html: markerSvg,
  className: '',
  iconSize: [28, 42],
  iconAnchor: [14, 42],
  popupAnchor: [0, -36],
})

const remoteMarkerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
  <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#2563eb" stroke="#fff" stroke-width="1.5"/>
  <circle cx="12" cy="12" r="5" fill="#fff"/>
</svg>`

const remoteIcon = L.divIcon({
  html: remoteMarkerSvg,
  className: '',
  iconSize: [28, 42],
  iconAnchor: [14, 42],
  popupAnchor: [0, -36],
})

interface RemoteSighting {
  id: number
  species_name: string | null
  scientific_name: string | null
  latitude: number
  longitude: number
  observed_at: string | null
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map(([lat, lng]) => [lat, lng]))
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
    }
  }, [map, points])
  return null
}

export default function SightingsMap() {
  const { user } = useAuth()
  const localSightings = useLiveQuery(() => db.sightings.toArray())
  const [remoteSightings, setRemoteSightings] = useState<RemoteSighting[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    getSightings(0, 200)
      .then((data: RemoteSighting[]) => setRemoteSightings(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const localWithCoords = localSightings?.filter((s) => s.lat && s.lng) ?? []
  const remoteWithCoords = remoteSightings.filter(
    (s) => s.latitude && s.longitude && s.latitude !== 0 && s.longitude !== 0
  )

  const allPoints: [number, number][] = [
    ...localWithCoords.map((s) => [s.lat!, s.lng!] as [number, number]),
    ...remoteWithCoords.map((s) => [s.latitude, s.longitude] as [number, number]),
  ]

  const center: [number, number] = allPoints.length > 0 ? allPoints[0] : [7.0, -73.9]

  const totalCount = localWithCoords.length + remoteWithCoords.length

  return (
    <div className="relative h-full w-full">
      <MapContainer center={center} zoom={allPoints.length > 0 ? 10 : 6} className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {allPoints.length > 1 && <FitBounds points={allPoints} />}

        {localWithCoords.map((s) => (
          <Marker key={`local-${s.id}`} position={[s.lat!, s.lng!]} icon={markerIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-bold text-green-700">{s.speciesName}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {new Date(s.date).toLocaleDateString('es-CO')}
                </p>
                <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Local
                </span>
              </div>
            </Popup>
          </Marker>
        ))}

        {remoteWithCoords.map((s) => (
          <Marker key={`remote-${s.id}`} position={[s.latitude, s.longitude]} icon={remoteIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-bold text-blue-700">{s.species_name || 'Especie desconocida'}</p>
                {s.scientific_name && (
                  <p className="text-gray-400 text-xs italic">{s.scientific_name}</p>
                )}
                {s.observed_at && (
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(s.observed_at).toLocaleDateString('es-CO')}
                  </p>
                )}
                <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  Sincronizado
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {loading && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-sm text-gray-600">
          Cargando avistamientos...
        </div>
      )}

      <div className="absolute bottom-24 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl shadow-md px-3 py-2 text-xs space-y-1">
        <p className="font-semibold text-gray-700">{totalCount} avistamiento{totalCount !== 1 ? 's' : ''}</p>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span className="text-gray-500">Local ({localWithCoords.length})</span>
        </div>
        {user && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span className="text-gray-500">Sincronizado ({remoteWithCoords.length})</span>
          </div>
        )}
      </div>
    </div>
  )
}
