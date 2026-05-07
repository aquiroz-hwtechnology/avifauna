export interface Taxonomy {
  kingdom: string
  phylum: string
  clase: string
  order: string
  family: string
  genus: string
  species: string
}

export interface Species {
  id: string
  commonName: string
  scientificName: string
  taxonomy: Taxonomy
  distribution?: string
  imageUrl?: string
}

export interface AlternativeSpecies {
  id: string
  name: string
  scientificName: string
  confidence: number
  imageUrl?: string | null
}

export interface IdentificationResult {
  species: Species
  confidence: number
  taxonomy: Taxonomy
  distribution?: string
  photoUrl?: string | null
  conservationStatus?: string | null
  observationsCount?: number | null
  wikipediaSummary?: string | null
  alternatives: AlternativeSpecies[]
}

export interface Sighting {
  id?: number
  speciesId: string
  speciesName: string
  scientificName?: string
  localName?: string
  confidence: number
  date: string
  lat: number | null
  lng: number | null
  photoUrl: string | null
  synced: boolean
  kingdom?: string
  phylum?: string
  clase?: string
  order?: string
  family?: string
  genus?: string
}

export interface GeoCoords {
  lat: number
  lng: number
  accuracy: number
}
