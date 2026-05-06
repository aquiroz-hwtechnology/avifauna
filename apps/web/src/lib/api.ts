import axios from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
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

export async function registerUser(name: string, email: string, password: string) {
  const { data } = await apiClient.post('/auth/register', { name, email, password })
  return data
}

export async function loginUser(email: string, password: string) {
  const formData = new URLSearchParams()
  formData.append('username', email)
  formData.append('password', password)
  const { data } = await apiClient.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data
}

export async function getMe() {
  const { data } = await apiClient.get('/auth/me')
  return data
}

export async function getDistribution(speciesId: string, lat?: number, lng?: number) {
  const params: Record<string, string | number> = {}
  if (lat !== undefined) params.lat = lat
  if (lng !== undefined) params.lng = lng
  const { data } = await apiClient.get(`/species/${speciesId}/distribution`, { params })
  return data
}

export async function searchSpecies(query: string) {
  const { data } = await apiClient.get('/species/search', { params: { q: query } })
  return data
}
