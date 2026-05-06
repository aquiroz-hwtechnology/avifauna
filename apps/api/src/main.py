from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import settings
from src.routers import auth, identify, sightings, species

app = FastAPI(
    title="Avifauna API",
    version="0.0.1",
    description="API para identificación y registro de aves",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Autenticación"])
app.include_router(identify.router, prefix="/identify", tags=["Identificación"])
app.include_router(sightings.router, prefix="/sightings", tags=["Avistamientos"])
app.include_router(species.router, prefix="/species", tags=["Especies"])


@app.get("/health")
def health():
    return {"status": "ok"}
