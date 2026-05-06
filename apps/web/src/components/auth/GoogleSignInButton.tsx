'use client'

import { useEffect, useRef, useCallback } from 'react'
import { googleLogin } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void
        }
      }
    }
  }
}

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '35542658251-k11tmquogc7aml81c0gpvctj20bqm087.apps.googleusercontent.com'

export default function GoogleSignInButton() {
  const buttonRef = useRef<HTMLDivElement>(null)
  const { login } = useAuth()
  const router = useRouter()

  const handleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      try {
        const data = await googleLogin(response.credential)
        login(data.access_token, data.user)
        router.push('/dashboard')
      } catch {
        alert('Error al iniciar sesión con Google')
      }
    },
    [login, router]
  )

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      })
      if (buttonRef.current) {
        window.google?.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          width: 320,
          locale: 'es',
        })
      }
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [handleCredentialResponse])

  if (!GOOGLE_CLIENT_ID) return null

  return (
    <div className="flex justify-center">
      <div ref={buttonRef} />
    </div>
  )
}
