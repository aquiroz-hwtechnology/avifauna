'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { IdentificationResult, AlternativeSpecies } from '@avifauna/types'

interface Props {
  result: IdentificationResult
  onSelectAlternative?: (alt: AlternativeSpecies) => void
}

const taxonomyLabels: Record<string, string> = {
  kingdom: 'Reino',
  phylum: 'Filo',
  clase: 'Clase',
  order: 'Orden',
  family: 'Familia',
  genus: 'Género',
  species: 'Especie',
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color =
    pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
  const label =
    pct >= 80 ? 'Alta' : pct >= 50 ? 'Media' : 'Baja'

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Nivel de confianza</span>
        <span className={`font-bold ${pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
          {pct}% — {label}
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function ConservationBadge({ status }: { status: string }) {
  const isDanger = ['Vulnerable', 'En Peligro', 'En Peligro Crítico', 'Extinta en Estado Silvestre', 'Extinta'].includes(status)
  const isWarning = status === 'Casi Amenazada'

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${
      isDanger ? 'bg-red-50 text-red-700' : isWarning ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
    }`}>
      <span>{isDanger ? '⚠️' : isWarning ? '🔶' : '✅'}</span>
      <span>{status}</span>
    </div>
  )
}

export default function IdentificationResultCard({ result, onSelectAlternative }: Props) {
  const { species, confidence, taxonomy, alternatives, conservationStatus, observationsCount, wikipediaSummary } = result
  const [showAlternatives, setShowAlternatives] = useState(false)

  return (
    <div className="space-y-4">
      {/* Main result card */}
      <div className="card overflow-hidden p-0">
        <div className="bg-gradient-to-r from-primary-700 to-primary-600 p-5 text-white">
          <div className="flex items-start gap-4">
            {species.imageUrl && (
              <Image
                src={species.imageUrl}
                alt={species.commonName}
                width={72}
                height={72}
                className="w-[72px] h-[72px] rounded-2xl object-cover border-2 border-white/30"
              />
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold">{species.commonName}</h2>
              <p className="italic text-primary-100 text-sm">{species.scientificName}</p>
              {observationsCount != null && observationsCount > 0 && (
                <p className="text-primary-200 text-xs mt-1">
                  {observationsCount.toLocaleString()} observaciones en iNaturalist
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <ConfidenceBar value={confidence} />

          {conservationStatus && (
            <ConservationBadge status={conservationStatus} />
          )}

          {wikipediaSummary && (
            <div className="bg-blue-50 rounded-xl px-4 py-3">
              <p className="text-xs text-blue-800 leading-relaxed line-clamp-3">
                {wikipediaSummary.replace(/<[^>]*>/g, '').slice(0, 200)}...
              </p>
            </div>
          )}

          <h3 className="font-semibold text-gray-700 text-sm">Taxonomía</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(taxonomy)
              .filter(([, v]) => v && typeof v === 'string' && v.length > 0)
              .map(([key, value]) => (
                <div key={key} className="bg-gray-50 rounded-xl px-3 py-2">
                  <span className="text-xs text-gray-400 font-medium">{taxonomyLabels[key] || key}</span>
                  <p className="text-sm font-semibold text-gray-800 truncate">{value as string}</p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Alternatives section */}
      {alternatives.length > 0 && (
        <div className="card">
          <button
            onClick={() => setShowAlternatives(!showAlternatives)}
            className="flex items-center justify-between w-full"
          >
            <h3 className="font-semibold text-gray-700 text-sm">
              Otras posibles especies ({alternatives.length})
            </h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showAlternatives ? 'rotate-180' : ''}`}
            >
              <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
            </svg>
          </button>

          {showAlternatives && (
            <div className="mt-3 space-y-2">
              {alternatives.map((alt, i) => (
                <button
                  key={i}
                  onClick={() => onSelectAlternative?.(alt)}
                  className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  {alt.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={alt.imageUrl}
                      alt={alt.name}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-lg">
                      🐦
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{alt.name || alt.scientificName}</p>
                    <p className="text-xs text-gray-400 italic truncate">{alt.scientificName}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className={`text-xs font-bold ${
                      alt.confidence >= 0.8 ? 'text-green-600' : alt.confidence >= 0.5 ? 'text-amber-600' : 'text-gray-400'
                    }`}>
                      {Math.round(alt.confidence * 100)}%
                    </span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-300 flex-shrink-0">
                    <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
                  </svg>
                </button>
              ))}
              <p className="text-[10px] text-gray-400 text-center pt-1">
                Toca una especie si consideras que es la identificación correcta
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
