"use client"

import { useState } from "react"
import { Loader2, Car, Eye, EyeOff } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

type LoginErrors    = { username: string; password: string }
type RegisterErrors = { username: string; email: string; password: string }

function FieldError({ msg }: { msg: string }) {
  if (!msg) return null
  return <p className="text-xs text-destructive mt-1">{msg}</p>
}

export function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  const { login, register } = useAuth()

  const [tab,         setTab]         = useState<"login" | "register">("login")
  const [loading,     setLoading]     = useState(false)
  const [serverError, setServerError] = useState("")

  const [showLoginPw,    setShowLoginPw]    = useState(false)
  const [showRegisterPw, setShowRegisterPw] = useState(false)

  const [loginForm,    setLoginForm]    = useState({ username: "", password: "" })
  const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "" })

  const [loginErrors,    setLoginErrors]    = useState<LoginErrors>({ username: "", password: "" })
  const [registerErrors, setRegisterErrors] = useState<RegisterErrors>({ username: "", email: "", password: "" })

  function validateLogin(): boolean {
    const e: LoginErrors = { username: "", password: "" }
    if (!loginForm.username.trim())
      e.username = "Username is required"
    else if (loginForm.username.trim().length < 3)
      e.username = "Must be at least 3 characters"
    if (!loginForm.password)
      e.password = "Password is required"
    else if (loginForm.password.length < 6)
      e.password = "Must be at least 6 characters"
    setLoginErrors(e)
    return !e.username && !e.password
  }

  function validateRegister(): boolean {
    const e: RegisterErrors = { username: "", email: "", password: "" }
    if (!registerForm.username.trim())
      e.username = "Username is required"
    else if (registerForm.username.trim().length < 3)
      e.username = "Must be at least 3 characters"
    else if (!/^[a-zA-Z0-9_]+$/.test(registerForm.username))
      e.username = "Only letters, numbers, and underscores"
    if (!registerForm.email.trim())
      e.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email))
      e.email = "Enter a valid email address"
    if (!registerForm.password)
      e.password = "Password is required"
    else if (registerForm.password.length < 8)
      e.password = "Must be at least 8 characters"
    setRegisterErrors(e)
    return !e.username && !e.email && !e.password
  }

  const resetAll = () => {
    setServerError("")
    setLoginErrors({ username: "", password: "" })
    setRegisterErrors({ username: "", email: "", password: "" })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateLogin()) return
    setLoading(true)
    setServerError("")
    try {
      await login(loginForm.username, loginForm.password)
      onOpenChange(false)
      onSuccess?.()
    } catch {
      setServerError("Invalid username or password.")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateRegister()) return
    setLoading(true)
    setServerError("")
    try {
      await register(registerForm)
      await login(registerForm.username, registerForm.password)
      onOpenChange(false)
      onSuccess?.()
    } catch {
      setServerError("Registration failed. Username or email may already be taken.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="items-center text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary mb-2">
            <Car className="h-5 w-5 text-primary-foreground" />
          </div>
          <DialogTitle>Welcome to Car MarketPlace</DialogTitle>
          <DialogDescription>
            {tab === "login" ? "Sign in to your account" : "Create a new account"}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => { setTab(v as "login" | "register"); resetAll() }}>
          <TabsList className="w-full">
            <TabsTrigger value="login"    className="flex-1">Login</TabsTrigger>
            <TabsTrigger value="register" className="flex-1">Register</TabsTrigger>
          </TabsList>

          {/* ── Login ── */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 pt-2" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="l-username">Username</Label>
                <Input
                  id="l-username"
                  autoComplete="username"
                  value={loginForm.username}
                  onChange={(e) => {
                    setLoginForm((p) => ({ ...p, username: e.target.value }))
                    setLoginErrors((p) => ({ ...p, username: "" }))
                  }}
                  className={cn(loginErrors.username && "border-destructive focus-visible:ring-destructive")}
                />
                <FieldError msg={loginErrors.username} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="l-password">Password</Label>
                <div className="relative">
                  <Input
                    id="l-password"
                    type={showLoginPw ? "text" : "password"}
                    autoComplete="current-password"
                    value={loginForm.password}
                    onChange={(e) => {
                      setLoginForm((p) => ({ ...p, password: e.target.value }))
                      setLoginErrors((p) => ({ ...p, password: "" }))
                    }}
                    className={cn("pr-10", loginErrors.password && "border-destructive focus-visible:ring-destructive")}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowLoginPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showLoginPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError msg={loginErrors.password} />
              </div>

              {serverError && <p className="text-sm text-destructive">{serverError}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </TabsContent>

          {/* ── Register ── */}
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4 pt-2" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="r-username">Username</Label>
                <Input
                  id="r-username"
                  autoComplete="username"
                  value={registerForm.username}
                  onChange={(e) => {
                    setRegisterForm((p) => ({ ...p, username: e.target.value }))
                    setRegisterErrors((p) => ({ ...p, username: "" }))
                  }}
                  className={cn(registerErrors.username && "border-destructive focus-visible:ring-destructive")}
                />
                <FieldError msg={registerErrors.username} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="r-email">Email</Label>
                <Input
                  id="r-email"
                  type="email"
                  autoComplete="email"
                  value={registerForm.email}
                  onChange={(e) => {
                    setRegisterForm((p) => ({ ...p, email: e.target.value }))
                    setRegisterErrors((p) => ({ ...p, email: "" }))
                  }}
                  className={cn(registerErrors.email && "border-destructive focus-visible:ring-destructive")}
                />
                <FieldError msg={registerErrors.email} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="r-password">Password</Label>
                <div className="relative">
                  <Input
                    id="r-password"
                    type={showRegisterPw ? "text" : "password"}
                    autoComplete="new-password"
                    value={registerForm.password}
                    onChange={(e) => {
                      setRegisterForm((p) => ({ ...p, password: e.target.value }))
                      setRegisterErrors((p) => ({ ...p, password: "" }))
                    }}
                    className={cn("pr-10", registerErrors.password && "border-destructive focus-visible:ring-destructive")}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowRegisterPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showRegisterPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError msg={registerErrors.password} />
              </div>

              {serverError && <p className="text-sm text-destructive">{serverError}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
