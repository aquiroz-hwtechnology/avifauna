from fastapi import APIRouter, Query, HTTPException
import httpx
from src.config import settings

router = APIRouter()


@router.get("/search")
async def search_species(q: str = Query(..., min_length=2)):
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(
            f"{settings.INATURALIST_API_URL}/taxa",
            params={"q": q, "rank": "species", "iconic_taxa": "Aves", "per_page": 10},
        )
        response.raise_for_status()
        data = response.json()

    return [
        {
            "id": str(t["id"]),
            "commonName": t.get("preferred_common_name", t["name"]),
            "scientificName": t["name"],
            "imageUrl": t.get("default_photo", {}).get("medium_url"),
        }
        for t in data.get("results", [])
    ]


@router.get("/{species_id}/distribution")
async def get_distribution(
    species_id: str,
    lat: float | None = Query(None, description="Latitud central para filtrar"),
    lng: float | None = Query(None, description="Longitud central para filtrar"),
):
    observations = await _get_inaturalist_observations(int(species_id), lat, lng)

    ebird_data = None
    if settings.EBIRD_API_KEY:
        ebird_data = await _get_ebird_observations(species_id, lat, lng)

    return {
        "taxon_id": species_id,
        "observations": observations,
        "ebird": ebird_data,
    }


async def _get_inaturalist_observations(
    taxon_id: int,
    lat: float | None = None,
    lng: float | None = None,
) -> list[dict]:
    params = {
        "taxon_id": taxon_id,
        "quality_grade": "research",
        "per_page": 100,
        "order_by": "observed_on",
        "geo": "true",
    }
    if lat is not None and lng is not None:
        params["lat"] = lat
        params["lng"] = lng
        params["radius"] = 200

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(
            f"{settings.INATURALIST_API_URL}/observations",
            params=params,
        )
        if response.status_code != 200:
            return []
        data = response.json()

    return [
        {
            "id": obs["id"],
            "latitude": obs.get("geojson", {}).get("coordinates", [None, None])[1],
            "longitude": obs.get("geojson", {}).get("coordinates", [None, None])[0],
            "observed_on": obs.get("observed_on"),
            "place": obs.get("place_guess"),
            "photo": (obs.get("photos") or [{}])[0].get("url"),
            "user": obs.get("user", {}).get("login"),
        }
        for obs in data.get("results", [])
        if obs.get("geojson")
    ]


async def _get_ebird_observations(
    species_id: str,
    lat: float | None = None,
    lng: float | None = None,
) -> list[dict] | None:
    if not lat or not lng:
        return None

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(
            f"{settings.EBIRD_API_URL}/data/obs/geo/recent",
            params={"lat": lat, "lng": lng, "dist": 50, "maxResults": 50},
            headers={"X-eBirdApiToken": settings.EBIRD_API_KEY},
        )
        if response.status_code != 200:
            return None
        return response.json()
