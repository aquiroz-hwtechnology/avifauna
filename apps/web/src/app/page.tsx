'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-hero text-white px-6 pt-12 pb-16 rounded-b-[2.5rem]">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-primary-200 text-sm font-medium">
                {user ? `Hola, ${user.name}` : 'Bienvenido a'}
              </p>
              <h1 className="text-3xl font-bold tracking-tight mt-1">Mi Fauna App</h1>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm">
              🦜
            </div>
          </div>

          <p className="text-primary-100 text-sm leading-relaxed mb-8">
            Identifica especies de fauna a partir de fotos, registra avistamientos
            con GPS y explora la biodiversidad de tu territorio.
          </p>

          <Link
            href="/identify"
            className="flex items-center justify-center gap-3 w-full bg-white text-primary-800 font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
              <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3H4.5a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" clipRule="evenodd" />
            </svg>
            Identificar Especie
          </Link>
        </div>
      </div>

      <div className="px-6 -mt-6 max-w-lg mx-auto space-y-4 animate-slide-up">
        <div className="grid grid-cols-2 gap-4">
          <Link href="/sightings" className="card group">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-primary-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-primary-600">
                <path fillRule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-8.583-.063C8.207 3.243 7.06 4.555 7.06 6.069v.006c.147-.003.295-.003.443-.003z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M4.25 8.625c0-1.036.84-1.875 1.875-1.875h8.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-8.75A1.875 1.875 0 014.25 19.875V8.625zm3 3a.75.75 0 01.75-.75h3.5a.75.75 0 010 1.5H8a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5H8z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800">Mis Registros</h3>
            <p className="text-xs text-gray-500 mt-1">Historial de avistamientos</p>
          </Link>

          <Link href="/map" className="card group">
            <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-sky-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-sky-500">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800">Mapa</h3>
            <p className="text-xs text-gray-500 mt-1">Explora avistamientos</p>
          </Link>
        </div>

        <Link href="/explore" className="card flex items-center gap-4 group">
          <div className="w-12 h-12 bg-earth-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-earth-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-earth-500">
              <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Explorar Especies</h3>
            <p className="text-xs text-gray-500 mt-1">Busca especies por nombre y descubre su distribución</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-300 ml-auto flex-shrink-0">
            <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
          </svg>
        </Link>

        <div className="card bg-gradient-to-r from-primary-50 to-emerald-50 border border-primary-100">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🌿</span>
            <div>
              <p className="text-sm text-primary-800 leading-relaxed">
                Herramienta de monitoreo ambiental para la conservación
                de la biodiversidad en el territorio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
