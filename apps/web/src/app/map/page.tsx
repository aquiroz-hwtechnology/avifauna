'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

const SightingsMap = dynamic(() => import('@/components/map/SightingsMap'), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-pulse-slow text-3xl mb-2">🗺️</div>
        <p className="text-gray-400 text-sm">Cargando mapa...</p>
      </div>
    </div>
  ),
})

function MapContent() {
  const searchParams = useSearchParams()
  const focusLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined
  const focusLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined
  const focusZoom = searchParams.get('zoom') ? parseInt(searchParams.get('zoom')!) : undefined

  return (
    <div className="h-screen flex flex-col">
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="glass mx-4 mt-4 px-4 py-3 pointer-events-auto inline-block">
          <h1 className="text-lg font-bold text-gray-800">Mapa de Avistamientos</h1>
        </div>
      </div>
      <div className="flex-1">
        <SightingsMap focusLat={focusLat} focusLng={focusLng} focusZoom={focusZoom} />
      </div>
    </div>
  )
}

export default function MapPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="animate-pulse text-gray-400">Cargando mapa...</div></div>}>
      <MapContent />
    </Suspense>
  )
}
