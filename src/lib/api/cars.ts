import { apiClient } from "./client"
import {
  AISearchResponse,
  CarCreate,
  CarFilters,
  CarResponse,
  VoiceSearchResponse,
} from "./types"

export async function getCars(filters?: CarFilters): Promise<CarResponse[]> {
  const res = await apiClient.get<CarResponse[]>("/cars/", { params: filters })
  return res.data
}

export async function getCar(id: number): Promise<CarResponse> {
  const res = await apiClient.get<CarResponse>(`/cars/${id}`)
  return res.data
}

export async function addCar(data: CarCreate): Promise<CarResponse> {
  const res = await apiClient.post<CarResponse>("/cars/", data)
  return res.data
}

export async function editCar(id: number, data: Partial<CarCreate>): Promise<CarResponse> {
  const res = await apiClient.put<CarResponse>(`/cars/${id}`, data)
  return res.data
}

export async function removeCar(id: number): Promise<void> {
  await apiClient.delete(`/cars/${id}`)
}

export async function aiSearch(query: string): Promise<AISearchResponse> {
  const res = await apiClient.get<AISearchResponse>("/cars/ai-search", {
    params: { query },
  })
  return res.data
}

export async function voiceSearch(audioBlob: Blob): Promise<VoiceSearchResponse> {
  const form = new FormData()
  form.append("audio", audioBlob, "recording.webm")
  const res = await apiClient.post<VoiceSearchResponse>("/cars/voice-search", form, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return res.data
}
