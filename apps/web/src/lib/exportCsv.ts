import type { Sighting } from '@avifauna/types'

export function exportSightingsCsv(sightings: Sighting[]) {
  const headers = [
    'Especie',
    'Nombre científico',
    'Reino',
    'Filo',
    'Clase',
    'Orden',
    'Familia',
    'Género',
    'Confianza (%)',
    'Fecha',
    'Hora',
    'Latitud',
    'Longitud',
    'Sincronizado',
    'URL Foto',
  ]

  const rows = sightings.map((s) => {
    const d = new Date(s.date)
    return [
      s.speciesName,
      s.scientificName ?? '',
      s.kingdom ?? '',
      s.phylum ?? '',
      s.clase ?? '',
      s.order ?? '',
      s.family ?? '',
      s.genus ?? '',
      s.confidence ? Math.round(s.confidence * 100) : '',
      d.toLocaleDateString('es-CO'),
      d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      s.lat ?? '',
      s.lng ?? '',
      s.synced ? 'Sí' : 'No',
      s.photoUrl ?? '',
    ]
  })

  const bom = '﻿'
  const csv = bom + [headers, ...rows]
    .map((row) =>
      row.map((cell) => {
        const str = String(cell)
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      }).join(',')
    )
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  link.href = url
  link.download = `mi-fauna-registros-${date}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
