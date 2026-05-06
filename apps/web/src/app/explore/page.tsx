'use client'

import { useState } from 'react'
import { searchSpecies, getDistribution } from '@/lib/api'
import Image from 'next/image'

interface SpeciesResult {
  id: string
  commonName: string
  scientificName: string
  imageUrl?: string
}

interface Observation {
  id: number
  latitude: number
  longitude: number
  observed_on: string
  place: string
  photo?: string
}

export default function ExplorePage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SpeciesResult[]>([])
  const [selected, setSelected] = useState<SpeciesResult | null>(null)
  const [observations, setObservations] = useState<Observation[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingDist, setLoadingDist] = useState(false)

  const handleSearch = async () => {
    if (query.length < 2) return
    setLoading(true)
    setSelected(null)
    setObservations([])
    try {
      const data = await searchSpecies(query)
      setResults(data)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = async (species: SpeciesResult) => {
    setSelected(species)
    setLoadingDist(true)
    try {
      const dist = await getDistribution(species.id)
      setObservations(dist.observations?.slice(0, 20) || [])
    } catch {
      setObservations([])
    } finally {
      setLoadingDist(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-hero text-white px-6 pt-12 pb-8 rounded-b-[2.5rem]">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-4">Explorar Especies</h1>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar por nombre..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-primary-200 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-3 bg-white text-primary-800 font-semibold rounded-xl hover:bg-primary-50 transition-colors"
            >
              {loading ? '...' : 'Buscar'}
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 mt-4 max-w-lg mx-auto space-y-3">
        {!selected && results.map((sp) => (
          <button
            key={sp.id}
            onClick={() => handleSelect(sp)}
            className="card w-full flex items-center gap-4 text-left"
          >
            {sp.imageUrl ? (
              <Image
                src={sp.imageUrl}
                alt={sp.commonName}
                width={56}
                height={56}
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 text-2xl">
                🐦
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-800 truncate">{sp.commonName}</h3>
              <p className="text-sm text-gray-500 italic truncate">{sp.scientificName}</p>
            </div>
          </button>
        ))}

        {selected && (
          <div className="animate-fade-in space-y-4">
            <button onClick={() => setSelected(null)} className="btn-ghost text-sm">
              ← Volver a resultados
            </button>

            <div className="card">
              <div className="flex items-center gap-4">
                {selected.imageUrl ? (
                  <Image
                    src={selected.imageUrl}
                    alt={selected.commonName}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-primary-50 flex items-center justify-center text-3xl">
                    🐦
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selected.commonName}</h2>
                  <p className="text-sm text-gray-500 italic">{selected.scientificName}</p>
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-gray-700 px-1">
              Observaciones recientes
              {loadingDist && <span className="text-primary-500 text-sm font-normal ml-2">Cargando...</span>}
            </h3>

            {observations.map((obs) => (
              <div key={obs.id} className="card flex items-center gap-3">
                {obs.photo ? (
                  <Image
                    src={obs.photo.replace('square', 'small')}
                    alt="Observación"
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-lg">
                    📍
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{obs.place || 'Ubicación desconocida'}</p>
                  <p className="text-xs text-gray-400">{obs.observed_on}</p>
                </div>
              </div>
            ))}

            {!loadingDist && observations.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                No se encontraron observaciones recientes
              </div>
            )}
          </div>
        )}

        {!selected && results.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-sm">Busca una especie por su nombre</p>
          </div>
        )}
      </div>
    </div>
  )
}
