# Avifauna

Aplicación web PWA para identificación y registro de aves mediante fotografía, GPS y datos taxonómicos.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| PWA / Offline | Service Workers, Dexie.js (IndexedDB) |
| Mapas | Leaflet + OpenStreetMap |
| Backend | FastAPI (Python 3.11+) |
| Base de datos | Supabase (PostgreSQL + PostGIS) |
| Identificación | iNaturalist Computer Vision API |
| Taxonomía / Distribución | eBird API (Cornell Lab) |

## Estructura

```
avifauna/
├── apps/
│   ├── web/          # Next.js PWA
│   └── api/          # FastAPI
├── packages/
│   └── types/        # Tipos TypeScript compartidos
└── turbo.json
```

## Inicio rápido

### Requisitos
- Node.js >= 20
- Python >= 3.11
- npm >= 10

### Frontend

```bash
cd apps/web
cp .env.local.example .env.local
# Editar .env.local con tus credenciales
npm install
npm run dev
```

### API

```bash
cd apps/api
cp .env.example .env
# Editar .env con tus credenciales
make install
make dev
```

La API estará disponible en `http://localhost:8000/docs`

## APIs externas necesarias

- **iNaturalist**: gratuita, sin clave para computer vision
- **eBird API**: registro gratuito en https://ebird.org/api/keygen
- **Supabase**: tier gratuito disponible en https://supabase.com

## Funcionalidades MVP

- [x] Subir foto → identificación de especie con % de confianza
- [x] Ver taxonomía completa (orden, familia, género, especie)
- [x] Registro automático de avistamiento con GPS
- [x] Mapa de avistamientos propios
- [x] Funciona offline (IndexedDB + sync al reconectar)
- [ ] Distribución geográfica de la especie (eBird)
- [ ] Autenticación con Supabase
- [ ] Sincronización en la nube
