import type { Sighting } from '@avifauna/types'
import Link from 'next/link'

interface Props {
  sighting: Sighting
}

export default function SightingCard({ sighting }: Props) {
  const date = new Date(sighting.date).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const time = new Date(sighting.date).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const confidence = sighting.confidence ? Math.round(sighting.confidence * 100) : null

  return (
    <Link href={`/sightings/${sighting.id}`} className="block">
      <div className="card flex gap-3 p-3 hover:shadow-card-hover transition-shadow active:scale-[0.99]">
        {sighting.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sighting.photoUrl}
            alt={sighting.speciesName}
            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 text-xl">
            🦎
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-800 truncate">{sighting.speciesName}</h3>
            {confidence !== null && (
              <span className={`text-xs rounded-full px-2 py-0.5 flex-shrink-0 font-medium ${
                confidence >= 80 ? 'bg-green-50 text-green-700' :
                confidence >= 50 ? 'bg-amber-50 text-amber-700' :
                'bg-red-50 text-red-600'
              }`}>
                {confidence}%
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{date} · {time}</p>
          <div className="flex items-center gap-2 mt-1">
            {sighting.lat && sighting.lng && (
              <span className="text-xs text-gray-400 flex items-center gap-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                </svg>
                {sighting.lat.toFixed(3)}, {sighting.lng.toFixed(3)}
              </span>
            )}
            <span className={`text-xs rounded-full px-1.5 py-0.5 font-medium ${
              sighting.synced
                ? 'bg-blue-50 text-blue-600'
                : 'bg-amber-50 text-amber-600'
            }`}>
              {sighting.synced ? '✓ Sync' : 'Pendiente'}
            </span>
          </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-300 flex-shrink-0 self-center">
          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
        </svg>
      </div>
    </Link>
  )
}
