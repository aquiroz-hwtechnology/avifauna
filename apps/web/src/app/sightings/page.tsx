'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import SightingCard from '@/components/sightings/SightingCard'
import Link from 'next/link'

export default function SightingsPage() {
  const sightings = useLiveQuery(() => db.sightings.orderBy('date').reverse().toArray())

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary-700">Mis Avistamientos</h1>
        <Link
          href="/identify"
          className="bg-primary-600 text-white text-sm font-semibold py-2 px-4 rounded-lg"
        >
          + Nuevo
        </Link>
      </div>

      {!sightings || sightings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">🔭</div>
          <p>Aún no tienes avistamientos registrados.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sightings.map((s) => (
            <SightingCard key={s.id} sighting={s} />
          ))}
        </div>
      )}
    </div>
  )
}
