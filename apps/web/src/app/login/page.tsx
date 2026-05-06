'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginUser } from '@/lib/api'
import { useAuth } from '@/lib/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await loginUser(email, password)
      login(data.access_token, data.user)
      router.push('/')
    } catch {
      setError('Correo o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-hero text-white px-6 pt-16 pb-20 rounded-b-[2.5rem]">
        <div className="max-w-sm mx-auto text-center">
          <div className="text-5xl mb-4">🦜</div>
          <h1 className="text-3xl font-bold">Mi Fauna App</h1>
          <p className="text-primary-200 text-sm mt-2">Inicia sesión para continuar</p>
        </div>
      </div>

      <div className="flex-1 px-6 -mt-8 max-w-sm mx-auto w-full">
        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="tu@correo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="********"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>

          <div className="text-center space-y-2">
            <Link href="/reset-password" className="text-sm text-primary-600 font-medium hover:underline block">
              ¿Olvidaste tu contraseña?
            </Link>
            <p className="text-sm text-gray-500">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-primary-600 font-semibold hover:underline">
                Regístrate
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
