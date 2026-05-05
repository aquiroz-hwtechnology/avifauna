import axios from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
  timeout: 15000,
})

export async function identifyBird(imageFile: File) {
  const formData = new FormData()
  formData.append('image', imageFile)
  const { data } = await apiClient.post('/identify', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function syncSightings(sightings: unknown[]) {
  const { data } = await apiClient.post('/sightings/sync', { sightings })
  return data
}
