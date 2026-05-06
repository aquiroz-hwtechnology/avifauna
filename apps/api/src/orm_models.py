from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False, default="")
    password_hash = Column(String(255), nullable=False, default="")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    sightings = relationship("Sighting", back_populates="user")


class Species(Base):
    __tablename__ = "species"

    id = Column(Integer, primary_key=True, index=True)
    common_name = Column(String(255), nullable=False)
    scientific_name = Column(String(255), nullable=False, unique=True, index=True)
    kingdom = Column(String(100), default="Animalia")
    phylum = Column(String(100), default="Chordata")
    class_ = Column("class", String(100), default="Aves")
    order = Column(String(100))
    family = Column(String(100))
    genus = Column(String(100))
    inaturalist_id = Column(Integer, nullable=True, index=True)
    ebird_code = Column(String(50), nullable=True, index=True)
    description = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)

    sightings = relationship("Sighting", back_populates="species")


class Sighting(Base):
    __tablename__ = "sightings"

    id = Column(Integer, primary_key=True, index=True)
    local_id = Column(String(100), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    species_id = Column(Integer, ForeignKey("species.id"), nullable=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    observed_at = Column(DateTime(timezone=True), nullable=False)
    photo_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    synced = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="sightings")
    species = relationship("Species", back_populates="sightings")
