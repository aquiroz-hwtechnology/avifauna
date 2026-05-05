'use client'

import { useState } from 'react'
import PhotoUploader from '@/components/identify/PhotoUploader'
import IdentificationResult from '@/components/identify/IdentificationResult'
import type { IdentificationResult as IResult } from '@avifauna/types'

export default function IdentifyPage() {
  const [result, setResult] = useState<IResult | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-primary-700 mb-6">Identificar Ave</h1>
      <PhotoUploader onResult={setResult} onLoading={setLoading} />
      {loading && (
        <div className="mt-8 text-center text-gray-500">Analizando imagen...</div>
      )}
      {result && !loading && <IdentificationResult result={result} />}
    </div>
  )
}
