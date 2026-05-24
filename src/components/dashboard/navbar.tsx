"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Search, Bell, Moon, Sun, Menu,
  LayoutDashboard, Car, PlusCircle, X, LogOut, LogIn,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { useAuth } from "@/lib/auth-context"
import { AuthModal } from "@/components/auth/auth-modal"
import { cn } from "@/lib/utils"

const navLinks = [
  { name: "Dashboard",   href: "/dashboard", icon: LayoutDashboard },
  { name: "Browse Cars", href: "/browse",    icon: Car },
]

export function Navbar() {
  const { setTheme, theme } = useTheme()
  const pathname = usePathname()
  const { isAuthenticated, username, logout, authModalOpen, openAuthModal, closeAuthModal } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = username ? username.slice(0, 2).toUpperCase() : "?"

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">

          {/* ── Left: logo + desktop nav ── */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Car className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="hidden text-base font-semibold sm:block">Car MarketPlace</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <link.icon className="h-3.5 w-3.5" />
                    {link.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* ── Center: search ── */}
          <div className="relative hidden md:block flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search cars..." className="pl-9 h-9 bg-muted/50 border-0 text-sm" />
          </div>

          {/* ── Right: actions ── */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Add Car */}
            <Button asChild size="sm" className="hidden sm:flex gap-1.5 rounded-lg">
              <Link href="/add-car">
                <PlusCircle className="h-4 w-4" />
                Add Car
              </Link>
            </Button>

            {/* Theme toggle */}
            <Button
              variant="ghost" size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative hidden sm:flex rounded-full">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
            </Button>

            {/* Auth: user menu or login button */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={username ?? ""} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-52" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium">{username}</p>
                    <p className="text-xs text-muted-foreground">Logged in</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" onClick={openAuthModal} className="gap-1.5 hidden sm:flex">
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            )}

            {/* Mobile hamburger */}
            <Button
              variant="ghost" size="icon"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden rounded-full"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-card border-r border-border flex flex-col shadow-2xl">
            <div className="flex h-16 items-center justify-between px-4 border-b border-border">
              <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Car className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-semibold">Car MarketPlace</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="px-4 py-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search cars..." className="pl-9 h-9 bg-muted/50 border-0 text-sm" />
              </div>
            </div>

            <nav className="flex-1 space-y-1 p-3">
              {navLinks.map((link) => {
                const active = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.name}
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t border-border space-y-2">
              <Button asChild className="w-full gap-2">
                <Link href="/add-car" onClick={() => setMobileOpen(false)}>
                  <PlusCircle className="h-4 w-4" />
                  Add Car
                </Link>
              </Button>
              {!isAuthenticated && (
                <Button variant="outline" className="w-full gap-2" onClick={() => { setMobileOpen(false); openAuthModal() }}>
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              )}
              {isAuthenticated && (
                <Button variant="ghost" className="w-full gap-2 text-destructive hover:text-destructive" onClick={() => { setMobileOpen(false); logout() }}>
                  <LogOut className="h-4 w-4" />
                  Log out ({username})
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Global auth modal ── */}
      <AuthModal open={authModalOpen} onOpenChange={closeAuthModal} />
    </>
  )
}
