"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Moon, Sun, Menu, LayoutDashboard, Car, PlusCircle, X, LogOut, LogIn,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
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

  const gradientStyle = {
    background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-chart-2) 100%)",
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">

          {/* ── Left: logo + desktop nav ── */}
          <div className="flex items-center gap-7">
            <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                style={gradientStyle}
              >
                <Car className="h-4 w-4 text-white" />
              </div>
              <span className="hidden text-[15px] font-bold tracking-tight sm:block">
                Car <span className="text-primary">Market</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-0.5">
              {navLinks.map(({ name, href, icon: Icon }) => {
                const active = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "relative flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-200",
                      active
                        ? "text-primary bg-primary/8"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {name}
                    {active && (
                      <span className="absolute bottom-0.5 left-4 right-4 h-0.5 rounded-full bg-primary/60" />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* ── Right: actions ── */}
          <div className="flex items-center gap-1 md:gap-2">

            {/* Add Car */}
            <Button
              asChild size="sm"
              className="hidden sm:flex gap-1.5 rounded-xl font-medium text-white shadow-sm"
              style={gradientStyle}
            >
              <Link href="/add-car">
                <PlusCircle className="h-4 w-4" />
                Add Car
              </Link>
            </Button>

            {/* Theme toggle */}
            <Button
              variant="ghost" size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl text-muted-foreground hover:text-foreground"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Auth */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-9 w-9 rounded-full p-0 ring-2 ring-transparent hover:ring-primary/30 transition-all"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={username ?? ""} />
                      <AvatarFallback className="text-xs font-bold text-white" style={gradientStyle}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-52" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs font-bold text-white" style={gradientStyle}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold leading-none">{username}</p>
                        <p className="text-xs text-muted-foreground mt-1">Signed in</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive focus:text-destructive focus:bg-destructive/8 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline" size="sm"
                onClick={openAuthModal}
                className="gap-1.5 hidden sm:flex rounded-xl border-border/70 font-medium"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            )}

            {/* Mobile hamburger */}
            <Button
              variant="ghost" size="icon"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden rounded-xl text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-card border-r border-border flex flex-col shadow-2xl">

            {/* Drawer header */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-border">
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5"
                onClick={() => setMobileOpen(false)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={gradientStyle}>
                  <Car className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold tracking-tight">
                  Car <span className="text-primary">Market</span>
                </span>
              </Link>
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setMobileOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 space-y-1 p-3 pt-4">
              {navLinks.map(({ name, href, icon: Icon }) => {
                const active = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-primary/8 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {name}
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Drawer footer */}
            <div className="p-4 border-t border-border space-y-2">
              <Button
                asChild
                className="w-full gap-2 rounded-xl font-medium text-white"
                style={gradientStyle}
              >
                <Link href="/add-car" onClick={() => setMobileOpen(false)}>
                  <PlusCircle className="h-4 w-4" />
                  Add Car
                </Link>
              </Button>

              {!isAuthenticated && (
                <Button
                  variant="outline"
                  className="w-full gap-2 rounded-xl"
                  onClick={() => { setMobileOpen(false); openAuthModal() }}
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              )}

              {isAuthenticated && (
                <Button
                  variant="ghost"
                  className="w-full gap-2 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/8"
                  onClick={() => { setMobileOpen(false); logout() }}
                >
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
