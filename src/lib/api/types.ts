// ── Auth ──────────────────────────────────────────────────────────────────────
export interface UserCreate {
  username: string
  email: string
  password: string
}

export interface UserResponse {
  id: number
  username: string
  email: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

// ── Cars ──────────────────────────────────────────────────────────────────────
export interface CarResponse {
  id: number
  name: string
  brand: string
  model: string
  price: number
  year: number
  city: string
  color: string
  mileage: number
  fuel_type: string
  transmission: string
  condition: string
  images: string | null
  description: string | null
}

export interface CarCreate {
  name: string
  brand: string
  model: string
  price: number
  year: number
  city: string
  color: string
  mileage: number
  fuel_type: string
  transmission: string
  condition: string
  images?: string | null
  description?: string | null
}

export interface CarFilters {
  name?: string
  brand?: string
  model?: string
  city?: string
  color?: string
  fuel_type?: string
  transmission?: string
  year?: number
  min_price?: number
  max_price?: number
  min_mileage?: number
  max_mileage?: number
}

export interface AISearchResponse {
  query: string
  results: CarResponse[]
}

export interface VoiceSearchResponse {
  transcribed_text: string
  query: string
  results: CarResponse[]
}

// ── Errors ────────────────────────────────────────────────────────────────────
export interface ApiError {
  detail: string | { loc: (string | number)[]; msg: string; type: string }[]
}
