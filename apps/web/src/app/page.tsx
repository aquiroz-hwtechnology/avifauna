import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl">🦜</div>
        <h1 className="text-4xl font-bold text-primary-700">Avifauna</h1>
        <p className="text-gray-500 text-lg">
          Identifica, registra y explora aves con ayuda de IA y GPS
        </p>
        <div className="flex flex-col gap-3 pt-4">
          <Link
            href="/identify"
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Identificar Ave
          </Link>
          <Link
            href="/sightings"
            className="border border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Mis Avistamientos
          </Link>
          <Link
            href="/map"
            className="border border-gray-300 text-gray-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Mapa
          </Link>
        </div>
      </div>
    </main>
  )
}
