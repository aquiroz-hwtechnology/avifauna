'use client'

import { useState } from 'react'
import PhotoUploader from '@/components/identify/PhotoUploader'
import IdentificationResult from '@/components/identify/IdentificationResult'
import type { IdentificationResult as IResult } from '@avifauna/types'

export default function IdentifyPage() {
  const [result, setResult] = useState<IResult | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-hero text-white px-6 pt-12 pb-8 rounded-b-[2.5rem]">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold">Identificar Especie</h1>
          <p className="text-primary-200 text-sm mt-1">Sube o toma una foto para identificar la especie de fauna</p>
        </div>
      </div>

      <div className="px-6 mt-4 max-w-lg mx-auto space-y-4">
        <PhotoUploader onResult={setResult} onLoading={setLoading} />

        {loading && (
          <div className="card text-center py-8">
            <div className="animate-pulse-slow text-4xl mb-3">🔬</div>
            <p className="text-gray-500 font-medium">Analizando imagen...</p>
            <p className="text-xs text-gray-400 mt-1">Consultando base de datos de iNaturalist</p>
          </div>
        )}

        {result && !loading && (
          <div className="animate-slide-up">
            <IdentificationResult result={result} />
          </div>
        )}
      </div>
    </div>
  )
}
