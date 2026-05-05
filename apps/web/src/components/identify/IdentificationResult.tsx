import type { IdentificationResult } from '@avifauna/types'

interface Props {
  result: IdentificationResult
}

export default function IdentificationResult({ result }: Props) {
  const { species, confidence, taxonomy } = result

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-primary-600 p-4 text-white">
        <h2 className="text-xl font-bold">{species.commonName}</h2>
        <p className="italic text-primary-100 text-sm">{species.scientificName}</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
            {Math.round(confidence * 100)}% confianza
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <section>
          <h3 className="font-semibold text-gray-700 mb-2">Taxonomía</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(taxonomy).map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-2">
                <span className="text-gray-400 capitalize">{key}</span>
                <p className="font-medium text-gray-800">{value as string}</p>
              </div>
            ))}
          </div>
        </section>

        {result.distribution && (
          <section>
            <h3 className="font-semibold text-gray-700 mb-1">Distribución</h3>
            <p className="text-sm text-gray-600">{result.distribution}</p>
          </section>
        )}
      </div>
    </div>
  )
}
