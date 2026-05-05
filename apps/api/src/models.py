from pydantic import BaseModel


class Taxonomy(BaseModel):
    kingdom: str = "Animalia"
    phylum: str = "Chordata"
    clase: str = "Aves"
    order: str
    family: str
    genus: str
    species: str


class Species(BaseModel):
    id: str
    commonName: str
    scientificName: str
    taxonomy: Taxonomy
    distribution: str | None = None
    imageUrl: str | None = None


class IdentificationResult(BaseModel):
    species: Species
    confidence: float
    taxonomy: Taxonomy
    distribution: str | None = None
    alternatives: list[dict] = []


class SightingIn(BaseModel):
    speciesId: str
    speciesName: str
    confidence: float
    date: str
    lat: float | None = None
    lng: float | None = None
    photoUrl: str | None = None


class SightingSyncRequest(BaseModel):
    sightings: list[SightingIn]
