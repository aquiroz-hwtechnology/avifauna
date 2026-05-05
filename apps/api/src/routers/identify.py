from fastapi import APIRouter, File, UploadFile, HTTPException
import httpx
from src.config import settings
from src.models import IdentificationResult, Species, Taxonomy

router = APIRouter()


async def query_inaturalist(image_bytes: bytes) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            f"{settings.INATURALIST_API_URL}/computervision/score_image",
            files={"image": ("photo.jpg", image_bytes, "image/jpeg")},
        )
        response.raise_for_status()
        return response.json()


def parse_inaturalist_result(data: dict) -> IdentificationResult:
    results = data.get("results", [])
    if not results:
        raise HTTPException(status_code(404), detail="No se identificó ningún ave")

    top = results[0]
    taxon = top.get("taxon", {})
    ancestors = taxon.get("ancestors", [])

    def find_rank(rank: str) -> str:
        for a in ancestors:
            if a.get("rank") == rank:
                return a.get("name", "")
        return ""

    taxonomy = Taxonomy(
        order=find_rank("order"),
        family=find_rank("family"),
        genus=find_rank("genus"),
        species=taxon.get("name", ""),
    )

    species = Species(
        id=str(taxon.get("id", "")),
        commonName=taxon.get("preferred_common_name", taxon.get("name", "")),
        scientificName=taxon.get("name", ""),
        taxonomy=taxonomy,
        imageUrl=taxon.get("default_photo", {}).get("medium_url"),
    )

    return IdentificationResult(
        species=species,
        confidence=top.get("combined_score", 0) / 100,
        taxonomy=taxonomy,
        alternatives=[
            {
                "name": r.get("taxon", {}).get("preferred_common_name", ""),
                "scientificName": r.get("taxon", {}).get("name", ""),
                "confidence": r.get("combined_score", 0) / 100,
            }
            for r in results[1:4]
        ],
    )


@router.post("", response_model=IdentificationResult)
async def identify_bird(image: UploadFile = File(...)):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")

    image_bytes = await image.read()
    data = await query_inaturalist(image_bytes)
    return parse_inaturalist_result(data)
