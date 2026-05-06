'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'

export default function ProfilePage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

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
