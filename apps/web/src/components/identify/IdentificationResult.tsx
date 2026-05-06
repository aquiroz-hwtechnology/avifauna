import Image from 'next/image'
import type { IdentificationResult } from '@avifauna/types'

interface Props {
  result: IdentificationResult
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

export default function IdentificationResultCard({ result }: Props) {
  const { species, confidence, taxonomy } = result

  return (
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
            <h2 className="text-xl font-bold truncate">{species.commonName}</h2>
            <p className="italic text-primary-100 text-sm">{species.scientificName}</p>
            <div className="mt-2 inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium">
              {Math.round(confidence * 100)}% confianza
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
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
  )
}
