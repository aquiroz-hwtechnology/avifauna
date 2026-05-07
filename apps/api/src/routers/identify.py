from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from typing import Optional
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

CONSERVATION_LABELS = {
    "NE": "No Evaluada",
    "DD": "Datos Insuficientes",
    "LC": "Preocupación Menor",
    "NT": "Casi Amenazada",
    "VU": "Vulnerable",
    "EN": "En Peligro",
    "CR": "En Peligro Crítico",
    "EW": "Extinta en Estado Silvestre",
    "EX": "Extinta",
}


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
        kingdom=find_rank("kingdom"),
        phylum=find_rank("phylum"),
        clase=find_rank("class"),
        order=find_rank("order"),
        family=find_rank("family"),
        genus=find_rank("genus"),
        species=taxon_detail.get("name", ""),
    )


def extract_conservation_status(taxon_detail: dict) -> str | None:
    statuses = taxon_detail.get("conservation_statuses", [])
    # Prefer IUCN global status
    for s in statuses:
        if s.get("authority") == "IUCN Red List" or s.get("iucn"):
            code = s.get("status", "").upper()
            return CONSERVATION_LABELS.get(code, code)
    # Fallback to any status
    if statuses:
        code = statuses[0].get("status", "").upper()
        return CONSERVATION_LABELS.get(code, code)
    return None


async def query_inaturalist(
    image_bytes: bytes, lat: float | None = None, lng: float | None = None
) -> dict:
    compressed = compress_image(image_bytes)
    url = f"{settings.INATURALIST_API_URL}/computervision/score_image"

    # Build multipart data with optional geo coords
    files = {"image": ("photo.jpg", compressed, "image/jpeg")}
    form_data = {}
    if lat is not None and lng is not None:
        form_data["lat"] = str(lat)
        form_data["lng"] = str(lng)

    async with httpx.AsyncClient(timeout=30) as client:
        headers = {}
        if settings.INATURALIST_API_TOKEN:
            headers["Authorization"] = settings.INATURALIST_API_TOKEN

        response = await client.post(
            url, files=files, data=form_data, headers=headers
        )

        if response.status_code == 401 and settings.INATURALIST_API_TOKEN:
            logger.warning(
                "iNaturalist token expired/invalid, retrying without auth"
            )
            compressed2 = compress_image(image_bytes)
            files2 = {"image": ("photo.jpg", compressed2, "image/jpeg")}
            response = await client.post(url, files=files2, data=form_data)

        response.raise_for_status()
        data = response.json()

        results = data.get("results", [])
        if not results:
            return data

        # Fetch detailed taxonomy for top result
        top_taxon_id = results[0].get("taxon", {}).get("id")
        if top_taxon_id:
            taxon_detail = await fetch_taxon_details(client, top_taxon_id)
            if taxon_detail:
                data["_taxon_detail"] = taxon_detail

        return data


def parse_inaturalist_result(data: dict) -> IdentificationResult:
    results = data.get("results", [])
    if not results:
        raise HTTPException(status_code=404, detail="No se identificó ninguna especie")

    top = results[0]
    taxon = top.get("taxon", {})

    taxon_detail = data.get("_taxon_detail", {})
    if taxon_detail:
        taxonomy = extract_taxonomy(taxon_detail)
    else:
        taxonomy = Taxonomy(species=taxon.get("name", ""))

    conservation_status = None
    wikipedia_summary = None
    observations_count = None

    if taxon_detail:
        conservation_status = extract_conservation_status(taxon_detail)
        wikipedia_summary = taxon_detail.get("wikipedia_summary")
        observations_count = taxon_detail.get("observations_count")

    species = Species(
        id=str(taxon.get("id", "")),
        commonName=taxon.get("preferred_common_name", taxon.get("name", "")),
        scientificName=taxon.get("name", ""),
        taxonomy=taxonomy,
        imageUrl=taxon.get("default_photo", {}).get("medium_url"),
    )

    # Build alternatives with images
    alternatives = []
    for r in results[1:6]:
        alt_taxon = r.get("taxon", {})
        alt_photo = alt_taxon.get("default_photo", {})
        alternatives.append(
            {
                "id": str(alt_taxon.get("id", "")),
                "name": alt_taxon.get(
                    "preferred_common_name", alt_taxon.get("name", "")
                ),
                "scientificName": alt_taxon.get("name", ""),
                "confidence": r.get("combined_score", 0) / 100,
                "imageUrl": alt_photo.get("square_url") if alt_photo else None,
            }
        )

    return IdentificationResult(
        species=species,
        confidence=top.get("combined_score", 0) / 100,
        taxonomy=taxonomy,
        conservationStatus=conservation_status,
        observationsCount=observations_count,
        wikipediaSummary=wikipedia_summary,
        alternatives=alternatives,
    )


@router.post("", response_model=IdentificationResult)
async def identify_bird(
    image: UploadFile = File(...),
    lat: Optional[float] = Form(None),
    lng: Optional[float] = Form(None),
):
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

    data = await query_inaturalist(image_bytes, lat=lat, lng=lng)
    result = parse_inaturalist_result(data)
    result.photoUrl = photo_url
    return result
