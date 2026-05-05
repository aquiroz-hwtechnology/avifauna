'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const icon = L.icon({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

export default function SightingsMap() {
  const sightings = useLiveQuery(() => db.sightings.toArray())
  const withCoords = sightings?.filter((s) => s.lat && s.lng) ?? []

  const center: [number, number] =
    withCoords.length > 0
      ? [withCoords[0].lat!, withCoords[0].lng!]
      : [4.5709, -74.2973]

  return (
    <MapContainer center={center} zoom={withCoords.length > 0 ? 10 : 5} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {withCoords.map((s) => (
        <Marker key={s.id} position={[s.lat!, s.lng!]} icon={icon}>
          <Popup>
            <strong>{s.speciesName}</strong>
            <br />
            {new Date(s.date).toLocaleDateString('es-CO')}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
