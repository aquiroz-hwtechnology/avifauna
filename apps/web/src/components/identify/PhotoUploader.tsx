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
      if (!identification) throw new Error('No se pudo identificar el ave')

      onResult(identification)

      await db.sightings.add({
        speciesId: identification.species.id,
        speciesName: identification.species.commonName,
        confidence: identification.confidence,
        date: new Date().toISOString(),
        lat: coords.status === 'fulfilled' ? coords.value.lat : null,
        lng: coords.status === 'fulfilled' ? coords.value.lng : null,
        photoUrl: preview,
        synced: false,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      onLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-primary-300 rounded-2xl p-8 text-center cursor-pointer hover:bg-primary-50 transition-colors"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Vista previa" className="max-h-64 mx-auto rounded-xl object-contain" />
        ) : (
          <div className="space-y-2 text-gray-400">
            <div className="text-4xl">📸</div>
            <p className="font-medium">Toca para subir una foto</p>
            <p className="text-sm">JPG, PNG o WEBP</p>
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
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
    </div>
  )
}
