import { apiClient } from "./client"
import { LoginResponse, UserCreate, UserResponse } from "./types"

export async function register(data: UserCreate): Promise<UserResponse> {
  const res = await apiClient.post<UserResponse>("/register", data)
  return res.data
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const body = new URLSearchParams({ username, password })
  const res = await apiClient.post<LoginResponse>("/login", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  })
  return res.data
}
