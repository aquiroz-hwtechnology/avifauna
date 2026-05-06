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

  const confidence = sighting.confidence ? Math.round(sighting.confidence * 100) : null

  return (
    <div className="card flex gap-3 p-3">
      {sighting.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sighting.photoUrl}
          alt={sighting.speciesName}
          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-16 h-16 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 text-xl">
          🐦
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-800 truncate">{sighting.speciesName}</h3>
          {confidence && (
            <span className="text-xs bg-primary-50 text-primary-700 rounded-full px-2 py-0.5 flex-shrink-0 font-medium">
              {confidence}%
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400">{date}</p>
        <div className="flex items-center gap-2 mt-1">
          {sighting.lat && sighting.lng && (
            <span className="text-xs text-gray-400">
              📍 {sighting.lat.toFixed(4)}, {sighting.lng.toFixed(4)}
            </span>
          )}
          {!sighting.synced && (
            <span className="text-xs bg-amber-50 text-amber-600 rounded-full px-2 py-0.5 font-medium">
              Sin sincronizar
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
