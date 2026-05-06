from fastapi import APIRouter, File, UploadFile, HTTPException
import httpx
import io
import logging
from PIL import Image
from src.config import settings
from src.models import IdentificationResult, Species, Taxonomy
from src.storage import upload_photo

logger = logging.getLogger(__name__)

router = APIRouter()

MAX_SIZE = (1024, 1024)


def compress_image(image_bytes: bytes) -> bytes:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img.thumbnail(MAX_SIZE, Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return buf.getvalue()


async def fetch_taxon_details(client: httpx.AsyncClient, taxon_id: int) -> dict:
    response = await client.get(
        f"{settings.INATURALIST_API_URL}/taxa/{taxon_id}",
    )
    if response.status_code == 200:
        results = response.json().get("results", [])
        if results:
            return results[0]
    return {}


def extract_taxonomy(taxon_detail: dict) -> Taxonomy:
    ancestors = taxon_detail.get("ancestors", [])

    def find_rank(rank: str) -> str:
        for a in ancestors:
            if a.get("rank") == rank:
                return a.get("name", "")
        return ""

    return Taxonomy(
        order=find_rank("order"),
        family=find_rank("family"),
        genus=find_rank("genus"),
        species=taxon_detail.get("name", ""),
    )


async def query_inaturalist(image_bytes: bytes) -> dict:
    compressed = compress_image(image_bytes)
    headers = {}
    if settings.INATURALIST_API_TOKEN:
        headers["Authorization"] = settings.INATURALIST_API_TOKEN
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            f"{settings.INATURALIST_API_URL}/computervision/score_image",
            files={"image": ("photo.jpg", compressed, "image/jpeg")},
            headers=headers,
        )
        response.raise_for_status()
        data = response.json()

        results = data.get("results", [])
        if not results:
            return data

        top_taxon_id = results[0].get("taxon", {}).get("id")
        if top_taxon_id:
            taxon_detail = await fetch_taxon_details(client, top_taxon_id)
            if taxon_detail:
                data["_taxon_detail"] = taxon_detail

        return data


def parse_inaturalist_result(data: dict) -> IdentificationResult:
    results = data.get("results", [])
    if not results:
        raise HTTPException(status_code=404, detail="No se identificó ningún ave")

    top = results[0]
    taxon = top.get("taxon", {})

    taxon_detail = data.get("_taxon_detail", {})
    if taxon_detail:
        taxonomy = extract_taxonomy(taxon_detail)
    else:
        taxonomy = Taxonomy(species=taxon.get("name", ""))

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

    photo_url: str | None = None
    if settings.AZURE_STORAGE_CONNECTION_STRING:
        try:
            compressed = compress_image(image_bytes)
            photo_url = await upload_photo(compressed)
        except Exception as e:
            logger.warning("Failed to upload photo to blob storage: %s", e)

    data = await query_inaturalist(image_bytes)
    result = parse_inaturalist_result(data)
    result.photoUrl = photo_url
    return result
