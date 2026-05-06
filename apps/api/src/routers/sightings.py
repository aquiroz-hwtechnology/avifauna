from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.database import get_db
from src.models import SightingIn, SightingSyncRequest
from src.orm_models import Sighting, Species

router = APIRouter()


async def get_or_create_species(db: AsyncSession, sighting_in: SightingIn) -> Species | None:
    if not sighting_in.speciesId:
        return None
    result = await db.execute(
        select(Species).where(Species.inaturalist_id == int(sighting_in.speciesId))
    )
    species = result.scalar_one_or_none()
    if species is None:
        species = Species(
            common_name=sighting_in.speciesName,
            scientific_name=sighting_in.speciesName,
            inaturalist_id=int(sighting_in.speciesId),
        )
        db.add(species)
        await db.flush()
    return species


@router.post("/sync")
async def sync_sightings(body: SightingSyncRequest, db: AsyncSession = Depends(get_db)):
    synced = 0
    failed = 0

    for s in body.sightings:
        try:
            species = await get_or_create_species(db, s)

            try:
                observed_at = datetime.fromisoformat(s.date.replace("Z", "+00:00"))
            except ValueError:
                observed_at = datetime.now(timezone.utc)

            sighting = Sighting(
                local_id=s.localId if hasattr(s, "localId") else None,
                species_id=species.id if species else None,
                latitude=s.lat or 0.0,
                longitude=s.lng or 0.0,
                observed_at=observed_at,
                photo_url=s.photoUrl,
                synced=True,
            )
            db.add(sighting)
            synced += 1
        except Exception:
            failed += 1

    await db.commit()
    return {"synced": synced, "failed": failed}


@router.get("")
async def list_sightings(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Sighting)
        .order_by(Sighting.observed_at.desc())
        .offset(skip)
        .limit(limit)
    )
    sightings = result.scalars().all()
    return [
        {
            "id": s.id,
            "local_id": s.local_id,
            "species_id": s.species_id,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "observed_at": s.observed_at.isoformat() if s.observed_at else None,
            "photo_url": s.photo_url,
            "notes": s.notes,
        }
        for s in sightings
    ]
