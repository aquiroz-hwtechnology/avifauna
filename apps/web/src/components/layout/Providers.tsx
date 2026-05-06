'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/lib/auth'
import { useAutoSync } from '@/lib/useAutoSync'

function AutoSync() {
  useAutoSync()
  return null
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AutoSync />
      {children}
    </AuthProvider>
  )
}
