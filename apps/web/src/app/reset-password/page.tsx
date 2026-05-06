'use client'

import { useState } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/lib/api'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    try {
      await resetPassword(email, newPassword)
      setSuccess(true)
    } catch {
      setError('No se encontró una cuenta con ese correo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-hero text-white px-6 pt-16 pb-20 rounded-b-[2.5rem]">
        <div className="max-w-sm mx-auto text-center">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold">Restablecer Contraseña</h1>
          <p className="text-primary-200 text-sm mt-2">Ingresa tu correo y nueva contraseña</p>
        </div>
      </div>

      <div className="flex-1 px-6 -mt-8 max-w-sm mx-auto w-full">
        {success ? (
          <div className="card space-y-4 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-green-500">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800">Contraseña actualizada</h2>
            <p className="text-sm text-gray-500">Ya puedes iniciar sesión con tu nueva contraseña</p>
            <Link href="/login" className="btn-primary block">
              Iniciar Sesión
            </Link>
          </div>
        ) : (
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Repite la contraseña"
                minLength={6}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
            </button>

            <p className="text-center text-sm text-gray-500">
              <Link href="/login" className="text-primary-600 font-semibold hover:underline">
                Volver a iniciar sesión
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
