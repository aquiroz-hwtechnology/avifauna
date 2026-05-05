export interface GeoCoords {
  lat: number
  lng: number
  accuracy: number
}

export function getCurrentPosition(): Promise<GeoCoords> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no disponible en este dispositivo'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => reject(new Error(err.message)),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  })
}
