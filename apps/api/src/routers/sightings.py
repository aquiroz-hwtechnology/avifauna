from fastapi import APIRouter
from src.models import SightingSyncRequest

router = APIRouter()


@router.post("/sync")
async def sync_sightings(body: SightingSyncRequest):
    # TODO: persist to Supabase when credentials are configured
    return {"synced": len(body.sightings), "failed": 0}
