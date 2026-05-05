import type { Sighting } from '@avifauna/types'

interface Props {
  sighting: Sighting
}

export default function SightingCard({ sighting }: Props) {
  const date = new Date(sighting.date).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex">
      {sighting.photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sighting.photoUrl}
          alt={sighting.speciesName}
          className="w-24 h-24 object-cover flex-shrink-0"
        />
      )}
      <div className="p-3 flex-1 min-w-0">
        <h3 className="font-semibold text-gray-800 truncate">{sighting.speciesName}</h3>
        <p className="text-sm text-gray-400">{date}</p>
        {sighting.lat && sighting.lng && (
          <p className="text-xs text-gray-400 mt-1">
            📍 {sighting.lat.toFixed(4)}, {sighting.lng.toFixed(4)}
          </p>
        )}
        {!sighting.synced && (
          <span className="inline-block mt-1 text-xs bg-yellow-100 text-yellow-700 rounded-full px-2 py-0.5">
            Pendiente sync
          </span>
        )}
      </div>
    </div>
  )
}
