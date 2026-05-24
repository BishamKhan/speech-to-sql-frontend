"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react"
import { login as apiLogin, register as apiRegister } from "./api/auth"
import { UserCreate } from "./api/types"

interface AuthContextType {
  token: string | null
  username: string | null
  isAuthenticated: boolean
  authModalOpen: boolean
  openAuthModal: () => void
  closeAuthModal: () => void
  login: (username: string, password: string) => Promise<void>
  register: (data: UserCreate) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken]               = useState<string | null>(null)
  const [username, setUsername]         = useState<string | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken    = localStorage.getItem("access_token")
    const storedUsername = localStorage.getItem("username")
    if (storedToken)    setToken(storedToken)
    if (storedUsername) setUsername(storedUsername)
  }, [])

  // Listen for 401 from interceptor → open login modal
  useEffect(() => {
    const handler = () => setAuthModalOpen(true)
    window.addEventListener("auth:unauthorized", handler)
    return () => window.removeEventListener("auth:unauthorized", handler)
  }, [])

  const login = useCallback(async (user: string, password: string) => {
    const res = await apiLogin(user, password)
    localStorage.setItem("access_token", res.access_token)
    localStorage.setItem("username", user)
    setToken(res.access_token)
    setUsername(user)
  }, [])

  const register = useCallback(async (data: UserCreate) => {
    await apiRegister(data)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("username")
    setToken(null)
    setUsername(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        isAuthenticated: !!token,
        authModalOpen,
        openAuthModal:  () => setAuthModalOpen(true),
        closeAuthModal: () => setAuthModalOpen(false),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}
