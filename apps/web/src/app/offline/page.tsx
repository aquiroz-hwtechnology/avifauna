'use client'

import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="card max-w-sm w-full text-center space-y-4 py-8">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-amber-500">
            <path fillRule="evenodd" d="M5.636 4.575a.75.75 0 010 1.06 9.75 9.75 0 000 13.792.75.75 0 01-1.06 1.06c-4.101-4.1-4.101-10.752 0-14.852a.75.75 0 011.06 0zm12.728 0a.75.75 0 011.06 0c4.101 4.1 4.101 10.751 0 14.851a.75.75 0 11-1.06-1.06 9.75 9.75 0 000-13.791.75.75 0 010-1.06zM8.11 7.05a.75.75 0 010 1.06 5.25 5.25 0 000 7.43.75.75 0 01-1.06 1.06 6.75 6.75 0 010-9.55.75.75 0 011.06 0zm7.78 0a.75.75 0 011.06 0 6.75 6.75 0 010 9.55.75.75 0 01-1.06-1.06 5.25 5.25 0 000-7.43.75.75 0 010-1.06zM12 12.75a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-800">Sin conexión</h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          No hay conexión a internet. Puedes seguir usando la app para revisar
          tus registros guardados localmente.
        </p>
        <div className="space-y-2 pt-2">
          <Link href="/sightings" className="btn-primary block">
            Ver Mis Registros
          </Link>
          <Link href="/map" className="block py-3 text-primary-600 font-semibold text-sm hover:underline">
            Ver Mapa (tiles cacheados)
          </Link>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Reintentar conexión
        </button>
      </div>
    </div>
  )
}
