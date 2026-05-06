import csv
import io
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case, cast, String

from src.database import get_db
from src.models import SightingIn, SightingSyncRequest
from src.orm_models import Sighting, Species, User
from src.auth import get_current_user

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
            scientific_name=sighting_in.scientificName or sighting_in.speciesName,
            inaturalist_id=int(sighting_in.speciesId),
            kingdom=sighting_in.kingdom or "Animalia",
            phylum=sighting_in.phylum or "Chordata",
            class_=sighting_in.clase or "",
            order=sighting_in.order or "",
            family=sighting_in.family or "",
            genus=sighting_in.genus or "",
        )
        db.add(species)
        await db.flush()
    return species


@router.post("/sync")
async def sync_sightings(
    body: SightingSyncRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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
                user_id=current_user.id,
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
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Sighting, Species)
        .outerjoin(Species, Sighting.species_id == Species.id)
        .where(Sighting.user_id == current_user.id)
        .order_by(Sighting.observed_at.desc())
        .offset(skip)
        .limit(limit)
    )
    rows = result.all()
    return [
        {
            "id": s.id,
            "local_id": s.local_id,
            "species_id": s.species_id,
            "species_name": sp.common_name if sp else None,
            "scientific_name": sp.scientific_name if sp else None,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "observed_at": s.observed_at.isoformat() if s.observed_at else None,
            "photo_url": s.photo_url,
            "notes": s.notes,
        }
        for s, sp in rows
    ]


@router.get("/export")
async def export_sightings_csv(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Sighting, Species)
        .outerjoin(Species, Sighting.species_id == Species.id)
        .where(Sighting.user_id == current_user.id)
        .order_by(Sighting.observed_at.desc())
    )
    rows = result.all()

    buf = io.StringIO()
    buf.write("﻿")
    writer = csv.writer(buf)
    writer.writerow([
        "Especie", "Nombre científico",
        "Reino", "Filo", "Clase", "Orden", "Familia", "Género",
        "Fecha", "Hora", "Latitud", "Longitud", "URL Foto", "Notas",
    ])
    for s, sp in rows:
        d = s.observed_at
        writer.writerow([
            sp.common_name if sp else "",
            sp.scientific_name if sp else "",
            sp.kingdom if sp else "",
            sp.phylum if sp else "",
            sp.class_ if sp else "",
            sp.order if sp else "",
            sp.family if sp else "",
            sp.genus if sp else "",
            d.strftime("%Y-%m-%d") if d else "",
            d.strftime("%H:%M") if d else "",
            s.latitude or "",
            s.longitude or "",
            s.photo_url or "",
            s.notes or "",
        ])

    buf.seek(0)
    date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return StreamingResponse(
        buf,
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="mi-fauna-registros-{date_str}.csv"'
        },
    )


@router.get("/stats")
async def sighting_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    base = select(Sighting).where(Sighting.user_id == current_user.id)

    total_res = await db.execute(select(func.count()).select_from(base.subquery()))
    total = total_res.scalar() or 0

    species_count_res = await db.execute(
        select(func.count(func.distinct(Sighting.species_id)))
        .where(Sighting.user_id == current_user.id)
        .where(Sighting.species_id.is_not(None))
    )
    species_count = species_count_res.scalar() or 0

    with_coords_res = await db.execute(
        select(func.count())
        .where(Sighting.user_id == current_user.id)
        .where(Sighting.latitude != 0)
        .where(Sighting.longitude != 0)
    )
    with_coords = with_coords_res.scalar() or 0

    by_species_res = await db.execute(
        select(Species.common_name, func.count(Sighting.id).label("count"))
        .join(Species, Sighting.species_id == Species.id)
        .where(Sighting.user_id == current_user.id)
        .group_by(Species.common_name)
        .order_by(func.count(Sighting.id).desc())
        .limit(10)
    )
    by_species = [{"name": r[0], "count": r[1]} for r in by_species_res.all()]

    by_family_res = await db.execute(
        select(Species.family, func.count(Sighting.id).label("count"))
        .join(Species, Sighting.species_id == Species.id)
        .where(Sighting.user_id == current_user.id)
        .where(Species.family.is_not(None))
        .where(Species.family != "")
        .group_by(Species.family)
        .order_by(func.count(Sighting.id).desc())
        .limit(10)
    )
    by_family = [{"name": r[0], "count": r[1]} for r in by_family_res.all()]

    by_order_res = await db.execute(
        select(Species.order, func.count(Sighting.id).label("count"))
        .join(Species, Sighting.species_id == Species.id)
        .where(Sighting.user_id == current_user.id)
        .where(Species.order.is_not(None))
        .where(Species.order != "")
        .group_by(Species.order)
        .order_by(func.count(Sighting.id).desc())
        .limit(10)
    )
    by_order = [{"name": r[0], "count": r[1]} for r in by_order_res.all()]

    by_month_res = await db.execute(
        select(
            func.to_char(Sighting.observed_at, "YYYY-MM").label("month"),
            func.count(Sighting.id).label("count"),
        )
        .where(Sighting.user_id == current_user.id)
        .group_by("month")
        .order_by("month")
        .limit(12)
    )
    by_month = [{"month": r[0], "count": r[1]} for r in by_month_res.all()]

    recent_res = await db.execute(
        select(Sighting, Species)
        .outerjoin(Species, Sighting.species_id == Species.id)
        .where(Sighting.user_id == current_user.id)
        .order_by(Sighting.observed_at.desc())
        .limit(5)
    )
    recent = [
        {
            "species_name": sp.common_name if sp else None,
            "observed_at": s.observed_at.isoformat() if s.observed_at else None,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "photo_url": s.photo_url,
        }
        for s, sp in recent_res.all()
    ]

    return {
        "total": total,
        "species_count": species_count,
        "with_coordinates": with_coords,
        "by_species": by_species,
        "by_family": by_family,
        "by_order": by_order,
        "by_month": by_month,
        "recent": recent,
    }
