'use client'

import { useState, useCallback, useRef } from 'react'
import PhotoUploader from '@/components/identify/PhotoUploader'
import IdentificationResultCard from '@/components/identify/IdentificationResult'
import { db } from '@/lib/db'
import type { IdentificationResult, GeoCoords } from '@avifauna/types'

interface IdentifyData {
  result: IdentificationResult
  coords: GeoCoords | null
}

export default function IdentifyPage() {
  const [data, setData] = useState<IdentifyData | null>(null)
  const [loading, setLoading] = useState(false)
  const [localName, setLocalName] = useState('')
  const [saved, setSaved] = useState(false)
  const uploaderKey = useRef(0)

  const handleResult = useCallback(async (identifyData: IdentifyData) => {
    setData(identifyData)
    setSaved(false)
    setLocalName('')

    try {
      const { result: identification, coords } = identifyData
      const tax = identification.taxonomy
      await db.sightings.add({
        speciesId: identification.species.id,
        speciesName: identification.species.commonName,
        scientificName: identification.species.scientificName,
        confidence: identification.confidence,
        date: new Date().toISOString(),
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        photoUrl: identification.photoUrl || null,
        synced: false,
        kingdom: tax?.kingdom,
        phylum: tax?.phylum,
        clase: tax?.clase,
        order: tax?.order,
        family: tax?.family,
        genus: tax?.genus,
      })
    } catch {
      // DB save failed silently - record still shows in UI
    }
  }, [])

  async function handleSaveLocalName() {
    if (!data || !localName.trim()) return
    const sightings = await db.sightings
      .where('speciesId')
      .equals(data.result.species.id)
      .reverse()
      .sortBy('date')
    if (sightings.length > 0) {
      await db.sightings.update(sightings[0].id!, { localName: localName.trim() })
      setSaved(true)
    }
  }

  function handleNewRecord() {
    setData(null)
    setLoading(false)
    setLocalName('')
    setSaved(false)
    uploaderKey.current += 1
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="bg-gradient-hero text-white px-6 pt-12 pb-8 rounded-b-[2.5rem]">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold">Identificar Especie</h1>
          <p className="text-primary-200 text-sm mt-1">Sube o toma una foto para identificar la especie de fauna</p>
        </div>
      </div>

      <div className="px-6 mt-4 max-w-lg mx-auto space-y-4">
        <PhotoUploader key={uploaderKey.current} onResult={handleResult} onLoading={setLoading} />

        {loading && (
          <div className="card text-center py-8">
            <div className="animate-pulse-slow text-4xl mb-3">🔬</div>
            <p className="text-gray-500 font-medium">Analizando imagen...</p>
            <p className="text-xs text-gray-400 mt-1">Consultando base de datos de iNaturalist</p>
          </div>
        )}

        {data && !loading && (
          <div className="animate-slide-up space-y-4">
            <IdentificationResultCard result={data.result} />

            <div className="card">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nombre Local o Común
              </label>
              <p className="text-xs text-gray-400 mb-3">
                Indique el nombre común con el que se conoce esta especie, en caso de disponer de esta información.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={localName}
                  onChange={(e) => {
                    setLocalName(e.target.value)
                    setSaved(false)
                  }}
                  placeholder="Ej: Garza morena, Pájaro carpintero..."
                  className="input-field flex-1"
                />
                <button
                  onClick={handleSaveLocalName}
                  disabled={!localName.trim() || saved}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex-shrink-0 ${
                    saved
                      ? 'bg-green-100 text-green-700'
                      : 'bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40'
                  }`}
                >
                  {saved ? '✓' : 'Guardar'}
                </button>
              </div>
            </div>

            <button
              onClick={handleNewRecord}
              className="w-full flex items-center justify-center gap-2 bg-white border-2 border-primary-200 text-primary-700 font-semibold py-3.5 px-6 rounded-2xl hover:bg-primary-50 transition-colors active:scale-[0.98]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
                <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3H4.5a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" clipRule="evenodd" />
              </svg>
              Nuevo Registro
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
