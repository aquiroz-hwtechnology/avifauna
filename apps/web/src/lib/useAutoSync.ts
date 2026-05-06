'use client'

import { useEffect, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useAuth } from '@/lib/auth'
import { syncSightings } from '@/lib/api'
import { db } from '@/lib/db'

export function useAutoSync() {
  const { user } = useAuth()
  const unsynced = useLiveQuery(() => db.sightings.where('synced').equals(0).toArray())
  const syncing = useRef(false)

  useEffect(() => {
    if (!user || !unsynced || unsynced.length === 0 || syncing.current) return

    const timer = setTimeout(async () => {
      syncing.current = true
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
        await syncSightings(payload)
        for (const s of unsynced) {
          if (s.id) await db.sightings.update(s.id, { synced: true })
        }
      } catch {
        // Will retry on next render cycle
      } finally {
        syncing.current = false
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [user, unsynced])
}
