import Dexie, { type EntityTable } from 'dexie'
import type { Sighting } from '@avifauna/types'

class AvifaunaDB extends Dexie {
  sightings!: EntityTable<Sighting, 'id'>

  constructor() {
    super('avifauna')
    this.version(1).stores({
      sightings: '++id, speciesId, date, synced',
    })
    this.version(2).stores({
      sightings: '++id, speciesId, date, synced',
    })
    this.version(3).stores({
      sightings: '++id, speciesId, date, synced',
    })
  }
}

export const db = new AvifaunaDB()
