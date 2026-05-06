'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import SightingCard from '@/components/sightings/SightingCard'
import Link from 'next/link'

type Filter = 'all' | 'synced' | 'pending'

export default function SightingsPage() {
  const sightings = useLiveQuery(() => db.sightings.orderBy('date').reverse().toArray())
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = sightings?.filter((s) => {
    if (filter === 'synced') return s.synced
    if (filter === 'pending') return !s.synced
    return true
  })

  const unsyncedCount = sightings?.filter((s) => !s.synced).length ?? 0

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-hero text-white px-6 pt-12 pb-8 rounded-b-[2.5rem]">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mis Registros</h1>
            <p className="text-primary-200 text-sm mt-1">
              {sightings ? `${sightings.length} avistamiento${sightings.length !== 1 ? 's' : ''}` : 'Cargando...'}
              {unsyncedCount > 0 && ` · ${unsyncedCount} pendiente${unsyncedCount !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Link
            href="/identify"
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="px-6 mt-4 max-w-lg mx-auto">
        {sightings && sightings.length > 0 && (
          <div className="flex gap-2 mb-4">
            {(['all', 'synced', 'pending'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  filter === f
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'Todos' : f === 'synced' ? 'Sincronizados' : 'Pendientes'}
              </button>
            ))}
          </div>
        )}

        {!sightings || sightings.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔭</span>
            </div>
            <h3 className="font-semibold text-gray-700 mb-1">Sin registros aún</h3>
            <p className="text-sm text-gray-400 mb-6">Identifica tu primera especie para comenzar</p>
            <Link href="/identify" className="btn-primary inline-block">
              Identificar Especie
            </Link>
          </div>
        ) : filtered && filtered.length === 0 ? (
          <div className="text-center py-12 animate-fade-in">
            <p className="text-sm text-gray-400">No hay registros con este filtro</p>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {filtered?.map((s) => (
              <SightingCard key={s.id} sighting={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
