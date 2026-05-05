from fastapi import APIRouter, Query
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
async def get_distribution(species_id: str):
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(
            f"{settings.EBIRD_API_URL}/ref/taxonomy/ebird",
            params={"species": species_id, "fmt": "json"},
            headers={"X-eBirdApiToken": settings.EBIRD_API_KEY},
        )
        if response.status_code == 200:
            return response.json()
    return {"distribution": None}
