import dynamic from 'next/dynamic'

const SightingsMap = dynamic(() => import('@/components/map/SightingsMap'), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center text-gray-400">
      Cargando mapa...
    </div>
  ),
})

export default function MapPage() {
  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 bg-white border-b">
        <h1 className="text-xl font-bold text-primary-700">Mapa de Avistamientos</h1>
      </div>
      <div className="flex-1">
        <SightingsMap />
      </div>
    </div>
  )
}
