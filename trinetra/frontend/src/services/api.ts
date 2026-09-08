import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
})

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = useAuthStore.getState().refreshToken
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/api/v1/auth/refresh`, { refresh_token: refreshToken })
          useAuthStore.getState().updateAccessToken(data.access_token)
          original.headers.Authorization = `Bearer ${data.access_token}`
          return api(original)
        } catch {
          useAuthStore.getState().logout()
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// ─── Auth ───────────────────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string, organization?: string) =>
    api.post('/auth/login', { username, password, organization }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refresh: (refresh_token: string) => api.post('/auth/refresh', { refresh_token }),
}

// ─── Demo ────────────────────────────────────────────────────────
export const demoApi = {
  loadDemo: () => api.post('/demo/load'),
  getStatus: () => api.get('/demo/status'),
  reset: () => api.post('/demo/reset'),
}

// ─── Datasets ────────────────────────────────────────────────────
export const datasetsApi = {
  list: () => api.get('/datasets'),
  get: (id: string) => api.get(`/datasets/${id}`),
  upload: (formData: FormData) =>
    api.post('/datasets/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/datasets/${id}`),
}

// ─── Preprocessing ───────────────────────────────────────────────
export const preprocessingApi = {
  run: (datasetIds: string[], propertyId?: string) =>
    api.post('/preprocessing/run', { dataset_ids: datasetIds, property_id: propertyId }),
  status: (runId: string) => api.get(`/preprocessing/${runId}/status`),
}

// ─── Extraction ──────────────────────────────────────────────────
export const extractionApi = {
  runBuildings: (propertyId: string) => api.post('/extraction/buildings', { property_id: propertyId }),
  runFloors: (propertyId: string) => api.post('/extraction/floors', { property_id: propertyId }),
  getResult: (propertyId: string) => api.get(`/extraction/${propertyId}`),
}

// ─── Candidates ──────────────────────────────────────────────────
export const candidatesApi = {
  generate: (propertyId: string) => api.post('/candidates/generate', { property_id: propertyId }),
  list: (propertyId: string) => api.get(`/candidates?property_id=${propertyId}`),
  get: (id: string) => api.get(`/candidates/${id}`),
}

// ─── QUBO ────────────────────────────────────────────────────────
export const quboApi = {
  create: (propertyId: string) => api.post('/qubo/create', { property_id: propertyId }),
  get: (id: string) => api.get(`/qubo/${id}`),
  listByProperty: (propertyId: string) => api.get(`/qubo?property_id=${propertyId}`),
}

// ─── QAOA ────────────────────────────────────────────────────────
export const qaoaApi = {
  run: (quboId: string, depthP = 1, shots = 1024) =>
    api.post(`/qaoa/run/${quboId}`, null, { params: { depth_p: depthP, shots } }),
  get: (id: string) => api.get(`/qaoa/${id}`),
}

// ─── Validation ──────────────────────────────────────────────────
export const validationApi = {
  run: (propertyId: string, qaoaRunId?: string) =>
    api.post('/validation/run', { property_id: propertyId, qaoa_run_id: qaoaRunId }),
  get: (id: string) => api.get(`/validation/${id}`),
  getByProperty: (propertyId: string) => api.get(`/validation?property_id=${propertyId}`),
}

// ─── ULPIN ───────────────────────────────────────────────────────
export const ulpinApi = {
  generate: (propertyId: string, validationId: string) =>
    api.post('/ulpin/generate', { property_id: propertyId, validation_id: validationId }),
  get: (ulpin: string) => api.get(`/ulpin/${ulpin}`),
}

// ─── Passport ────────────────────────────────────────────────────
export const passportApi = {
  get: (propertyId: string) => api.get(`/passport/${propertyId}`),
  getQR: (propertyId: string) => api.get(`/passport/${propertyId}/qr`),
}

// ─── Properties ──────────────────────────────────────────────────
export const propertiesApi = {
  list: (params?: Record<string, string>) => api.get('/properties', { params }),
  get: (id: string) => api.get(`/properties/${id}`),
  search: (query: string) => api.get('/properties/search', { params: { q: query } }),
}

// ─── Encroachment ────────────────────────────────────────────────
export const encroachmentApi = {
  detect: (propertyId: string) => api.post('/encroachment/detect', { property_id: propertyId }),
  list: (propertyId?: string) => api.get('/encroachment', { params: { property_id: propertyId } }),
  review: (caseId: string, status: string, notes: string) =>
    api.post(`/encroachment/${caseId}/review`, { status, notes }),
}

// ─── Discrepancy ─────────────────────────────────────────────────
export const discrepancyApi = {
  detect: (propertyId: string) => api.post('/discrepancy/detect', { property_id: propertyId }),
  list: (propertyId?: string) => api.get('/discrepancy', { params: { property_id: propertyId } }),
  review: (id: string, status: string) => api.post(`/discrepancy/${id}/review`, { status }),
}

// ─── Confidence ──────────────────────────────────────────────────
export const confidenceApi = {
  calculate: (propertyId: string) => api.post(`/confidence/${propertyId}/calculate`),
  get: (propertyId: string) => api.get(`/confidence/${propertyId}`),
}

// ─── Change Detection ────────────────────────────────────────────
export const changeApi = {
  detect: (propertyId: string) => api.post('/change-detection/detect', { property_id: propertyId }),
  list: (propertyId?: string) => api.get('/change-detection', { params: { property_id: propertyId } }),
}

// ─── GIS ─────────────────────────────────────────────────────────
export const gisApi = {
  layers: () => api.get('/gis/layers'),
  query: (intent: string) => api.post('/gis/query', { intent }),
  getProperty3D: (propertyId: string) => api.get(`/gis/property3d/${propertyId}`),
}

// ─── Utilities ───────────────────────────────────────────────────
export const utilitiesApi = {
  list: (bbox?: string) => api.get('/utilities', { params: { bbox } }),
}

// ─── Audit ───────────────────────────────────────────────────────
export const auditApi = {
  list: (params?: Record<string, string>) => api.get('/audit', { params }),
}

// ─── Users ───────────────────────────────────────────────────────
export const usersApi = {
  list: () => api.get('/users'),
  get: (id: string) => api.get(`/users/${id}`),
  create: (data: Record<string, unknown>) => api.post('/users', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/users/${id}`, data),
  deactivate: (id: string) => api.post(`/users/${id}/deactivate`),
}

// ─── Reports ─────────────────────────────────────────────────────
export const reportsApi = {
  generate: (type: string, propertyId: string) =>
    api.post('/reports/generate', { type, property_id: propertyId }),
}
