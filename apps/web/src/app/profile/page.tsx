'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLiveQuery } from 'dexie-react-hooks'
import { useAuth } from '@/lib/auth'
import { syncSightings } from '@/lib/api'
import { db } from '@/lib/db'

export default function ProfilePage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)

  const sightings = useLiveQuery(() => db.sightings.toArray())
  const unsynced = sightings?.filter((s) => !s.synced) ?? []
  const total = sightings?.length ?? 0

  const handleSync = async () => {
    if (unsynced.length === 0) return
    setSyncing(true)
    setSyncResult(null)
    try {
      const payload = unsynced.map((s) => ({
        localId: String(s.id),
        speciesId: s.speciesId,
        speciesName: s.speciesName,
        confidence: s.confidence,
        date: s.date,
        lat: s.lat,
        lng: s.lng,
        photoUrl: s.photoUrl,
      }))
      const result = await syncSightings(payload)
      for (const s of unsynced) {
        if (s.id) await db.sightings.update(s.id, { synced: true })
      }
      setSyncResult(`${result.synced} avistamiento${result.synced !== 1 ? 's' : ''} sincronizado${result.synced !== 1 ? 's' : ''}`)
    } catch {
      setSyncResult('Error al sincronizar. Intenta de nuevo.')
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Cargando...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="card max-w-sm w-full text-center space-y-4">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary-600">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Inicia sesión</h2>
          <p className="text-sm text-gray-500">Para sincronizar tus avistamientos y acceder desde cualquier dispositivo</p>
          <Link href="/login" className="btn-primary block">Iniciar Sesión</Link>
          <Link href="/register" className="btn-outline block">Crear Cuenta</Link>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-hero text-white px-6 pt-12 pb-16 rounded-b-[2.5rem]">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-primary-200 text-sm">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-6 max-w-lg mx-auto space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="card text-center">
            <p className="text-3xl font-bold text-primary-600">{total}</p>
            <p className="text-xs text-gray-500 mt-1">Avistamientos</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-sky-500">{total - unsynced.length}</p>
            <p className="text-xs text-gray-500 mt-1">Sincronizados</p>
          </div>
        </div>

        {unsynced.length > 0 && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`}>
              <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm14.49 3.882a7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-1.45-.388z" clipRule="evenodd" />
            </svg>
            {syncing ? 'Sincronizando...' : `Sincronizar ${unsynced.length} pendiente${unsynced.length !== 1 ? 's' : ''}`}
          </button>
        )}

        {syncResult && (
          <div className={`text-sm text-center px-4 py-3 rounded-xl ${syncResult.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {syncResult}
          </div>
        )}

        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-3">Cuenta</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Nombre</span>
              <span className="text-sm font-medium text-gray-800">{user.name}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Correo</span>
              <span className="text-sm font-medium text-gray-800">{user.email}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-3 text-red-500 font-semibold rounded-2xl border border-red-200 hover:bg-red-50 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}
