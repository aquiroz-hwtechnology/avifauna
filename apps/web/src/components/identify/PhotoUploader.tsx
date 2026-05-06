'use client'

import { useRef, useState } from 'react'
import { identifyBird } from '@/lib/api'
import { getCurrentPosition } from '@/lib/geolocation'
import { db } from '@/lib/db'
import type { IdentificationResult } from '@avifauna/types'

interface Props {
  onResult: (result: IdentificationResult) => void
  onLoading: (loading: boolean) => void
}

export default function PhotoUploader({ onResult, onLoading }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)
    setPreview(URL.createObjectURL(file))
    onLoading(true)

    try {
      const [result, coords] = await Promise.allSettled([
        identifyBird(file),
        getCurrentPosition(),
      ])

      const identification = result.status === 'fulfilled' ? result.value : null
      if (!identification) throw new Error('No se pudo identificar la especie')

      onResult(identification)

      await db.sightings.add({
        speciesId: identification.species.id,
        speciesName: identification.species.commonName,
        confidence: identification.confidence,
        date: new Date().toISOString(),
        lat: coords.status === 'fulfilled' ? coords.value.lat : null,
        lng: coords.status === 'fulfilled' ? coords.value.lng : null,
        photoUrl: identification.photoUrl || null,
        synced: false,
      })
    } catch (err) {
      if (err instanceof Error && err.message.includes('timeout')) {
        setError('La conexión tardó demasiado. Intenta de nuevo.')
      } else {
        setError(err instanceof Error ? err.message : 'Error al identificar la especie')
      }
    } finally {
      onLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div
        onClick={() => inputRef.current?.click()}
        className="card cursor-pointer hover:shadow-card-hover group overflow-hidden"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Vista previa" className="max-h-72 mx-auto rounded-xl object-contain" />
        ) : (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary-500">
                <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
                <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3H4.5a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="font-semibold text-gray-700">Toca para subir una foto</p>
            <p className="text-sm text-gray-400 mt-1">JPG, PNG o usa la cámara</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl text-center">{error}</div>
      )}
    </div>
  )
}
