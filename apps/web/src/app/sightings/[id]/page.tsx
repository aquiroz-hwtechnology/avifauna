'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import type { Sighting } from '@avifauna/types'

export default function SightingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [sighting, setSighting] = useState<Sighting | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    db.sightings.get(Number(id)).then((s) => {
      setSighting(s ?? null)
      setLoading(false)
    })
  }, [id])

  const handleDelete = async () => {
    if (!sighting?.id) return
    await db.sightings.delete(sighting.id)
    router.push('/sightings')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Cargando...</div>
      </div>
    )
  }

  if (!sighting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-gray-500 mb-4">Registro no encontrado</p>
        <Link href="/sightings" className="btn-primary">Volver a registros</Link>
      </div>
    )
  }

  const date = new Date(sighting.date).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const time = new Date(sighting.date).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const confidence = sighting.confidence ? Math.round(sighting.confidence * 100) : null

  return (
    <div className="min-h-screen">
      {sighting.photoUrl ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sighting.photoUrl}
            alt={sighting.speciesName}
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-2xl font-bold text-white">{sighting.speciesName}</h1>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-hero text-white px-6 pt-12 pb-8 rounded-b-[2.5rem]">
          <div className="max-w-lg mx-auto">
            <button onClick={() => router.back()} className="mb-4 text-primary-200 flex items-center gap-1 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
              </svg>
              Volver
            </button>
            <h1 className="text-2xl font-bold">{sighting.speciesName}</h1>
          </div>
        </div>
      )}

      <div className="px-6 py-4 max-w-lg mx-auto space-y-4">
        <div className="card space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Fecha</span>
            <span className="text-sm font-medium text-gray-800 capitalize">{date}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Hora</span>
            <span className="text-sm font-medium text-gray-800">{time}</span>
          </div>
          {confidence !== null && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Confianza</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      confidence >= 80 ? 'bg-green-500' :
                      confidence >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${confidence}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-800">{confidence}%</span>
              </div>
            </div>
          )}
          {sighting.lat && sighting.lng && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Ubicación</span>
              <span className="text-sm font-medium text-gray-800">
                {sighting.lat.toFixed(5)}, {sighting.lng.toFixed(5)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Estado</span>
            <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${
              sighting.synced
                ? 'bg-blue-50 text-blue-600'
                : 'bg-amber-50 text-amber-600'
            }`}>
              {sighting.synced ? 'Sincronizado' : 'Pendiente de sincronizar'}
            </span>
          </div>
        </div>

        {sighting.lat && sighting.lng && (
          <Link
            href={`/map`}
            className="card flex items-center gap-3 group hover:shadow-card-hover transition-shadow"
          >
            <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-sky-500">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Ver en el mapa</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-300 ml-auto">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </Link>
        )}

        <button
          onClick={handleDelete}
          className="w-full py-3 text-red-500 font-semibold rounded-2xl border border-red-200 hover:bg-red-50 transition-colors text-sm"
        >
          Eliminar registro
        </button>
      </div>
    </div>
  )
}
