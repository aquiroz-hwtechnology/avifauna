'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { getSightingStats } from '@/lib/api'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

interface RecentRecord {
  species_name: string | null
  family: string | null
  order: string | null
  observed_at: string | null
  latitude: number
  longitude: number
  photo_url: string | null
}

interface Stats {
  total: number
  species_count: number
  with_coordinates: number
  by_species: { name: string; count: number }[]
  by_family: { name: string; count: number }[]
  by_order: { name: string; count: number }[]
  by_month: { month: string; count: number }[]
  recent: RecentRecord[]
}

type TabKey = 'species' | 'family' | 'order'

const COLORS = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#be185d', '#65a30d', '#ea580c', '#6366f1']

function BarChart({
  data,
  maxCount,
  selectedName,
  onSelect,
}: {
  data: { name: string; count: number }[]
  maxCount: number
  selectedName: string | null
  onSelect: (name: string | null) => void
}) {
  return (
    <div className="space-y-2">
      {data.map((item, i) => {
        const isSelected = selectedName === item.name
        const isDimmed = selectedName !== null && !isSelected
        return (
          <button
            key={item.name}
            onClick={() => onSelect(isSelected ? null : item.name)}
            className={`flex items-center gap-3 w-full text-left rounded-lg px-1 py-0.5 transition-all duration-200 ${
              isSelected ? 'bg-primary-50 ring-2 ring-primary-300' : isDimmed ? 'opacity-40' : 'hover:bg-gray-50'
            }`}
          >
            <div className="w-28 text-xs text-gray-600 truncate text-right flex-shrink-0" title={item.name}>
              {item.name}
            </div>
            <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max((item.count / maxCount) * 100, 4)}%`,
                  backgroundColor: COLORS[i % COLORS.length],
                }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-700 w-6 text-right">{item.count}</span>
          </button>
        )
      })}
    </div>
  )
}

function MonthChart({ data }: { data: { month: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1)
  return (
    <div className="flex items-end gap-1.5 h-32">
      {data.map((item) => {
        const label = item.month.slice(5)
        return (
          <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] font-semibold text-gray-600">{item.count}</span>
            <div
              className="w-full bg-primary-500 rounded-t-md transition-all duration-500"
              style={{ height: `${Math.max((item.count / max) * 100, 4)}%` }}
            />
            <span className="text-[10px] text-gray-400">{label}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabKey>('species')
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)

  const localSightings = useLiveQuery(() => db.sightings.toArray())
  const localTotal = localSightings?.length ?? 0
  const localSpecies = new Set(localSightings?.map((s) => s.speciesName)).size

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    getSightingStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  useEffect(() => {
    setSelectedFilter(null)
  }, [tab])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Cargando estadísticas...</div>
      </div>
    )
  }

  const totalSightings = stats ? stats.total : localTotal
  const totalSpecies = stats ? stats.species_count : localSpecies
  const withCoords = stats?.with_coordinates ?? localSightings?.filter((s) => s.lat && s.lng).length ?? 0

  const tabData = stats
    ? tab === 'species'
      ? stats.by_species
      : tab === 'family'
      ? stats.by_family
      : stats.by_order
    : []

  const maxCount = Math.max(...tabData.map((d) => d.count), 1)

  const filteredRecent = stats
    ? selectedFilter
      ? stats.recent.filter((r) => {
          if (tab === 'species') return r.species_name === selectedFilter
          if (tab === 'family') return r.family === selectedFilter
          return r.order === selectedFilter
        })
      : stats.recent
    : []

  const displayRecent = filteredRecent.slice(0, 20)

  return (
    <div className="min-h-screen pb-24">
      <div className="bg-gradient-hero text-white px-6 pt-12 pb-8 rounded-b-[2.5rem]">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-primary-200 text-sm mt-1">Resumen de tu actividad de monitoreo</p>
        </div>
      </div>

      <div className="px-6 -mt-4 max-w-lg mx-auto space-y-4 animate-fade-in">
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center py-4 px-2">
            <p className="text-2xl font-bold text-primary-600">{totalSightings}</p>
            <p className="text-[10px] text-gray-500 mt-1 leading-tight">Avistamientos</p>
          </div>
          <div className="card text-center py-4 px-2">
            <p className="text-2xl font-bold text-sky-500">{totalSpecies}</p>
            <p className="text-[10px] text-gray-500 mt-1 leading-tight">Especies</p>
          </div>
          <div className="card text-center py-4 px-2">
            <p className="text-2xl font-bold text-amber-500">{withCoords}</p>
            <p className="text-[10px] text-gray-500 mt-1 leading-tight">Con ubicación</p>
          </div>
        </div>

        {stats && stats.by_month.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Avistamientos por mes</h3>
            <MonthChart data={stats.by_month} />
          </div>
        )}

        {stats && tabData.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 text-sm">Distribución taxonómica</h3>
              {selectedFilter && (
                <button
                  onClick={() => setSelectedFilter(null)}
                  className="text-[10px] text-primary-600 font-medium hover:underline"
                >
                  Limpiar filtro
                </button>
              )}
            </div>
            <div className="flex gap-1.5 mb-4">
              {(['species', 'family', 'order'] as TabKey[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    tab === t
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {t === 'species' ? 'Especie' : t === 'family' ? 'Familia' : 'Orden'}
                </button>
              ))}
            </div>
            <BarChart
              data={tabData}
              maxCount={maxCount}
              selectedName={selectedFilter}
              onSelect={setSelectedFilter}
            />
          </div>
        )}

        {stats && displayRecent.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 text-sm">
                {selectedFilter ? `Registros: ${selectedFilter}` : 'Registros recientes'}
              </h3>
              <span className="text-[10px] text-gray-400">{filteredRecent.length} registros</span>
            </div>
            <div className="space-y-3">
              {displayRecent.map((r, i) => (
                <div key={i} className="flex items-center gap-3">
                  {r.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.photo_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 text-sm">
                      🐦
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{r.species_name || 'Desconocida'}</p>
                    {r.observed_at && (
                      <p className="text-xs text-gray-400">
                        {new Date(r.observed_at).toLocaleDateString('es-CO', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    )}
                  </div>
                  {r.latitude !== 0 && r.longitude !== 0 && (
                    <Link
                      href={`/map?lat=${r.latitude}&lng=${r.longitude}&zoom=15`}
                      className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 hover:bg-red-100 transition-colors"
                      title="Ver en mapa"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-500">
                        <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {stats && selectedFilter && filteredRecent.length === 0 && (
          <div className="card text-center py-6">
            <p className="text-sm text-gray-500">No hay registros para "{selectedFilter}"</p>
          </div>
        )}

        {!user && (
          <div className="card bg-gradient-to-r from-primary-50 to-emerald-50 border border-primary-100 text-center">
            <p className="text-sm text-primary-800 mb-3">
              Inicia sesión para ver estadísticas completas de tus registros sincronizados
            </p>
            <Link href="/login" className="btn-primary inline-block text-sm">Iniciar Sesión</Link>
          </div>
        )}

        {stats && totalSightings === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">Aún no tienes registros sincronizados</p>
            <Link href="/identify" className="btn-primary inline-block text-sm">
              Identificar Especie
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
