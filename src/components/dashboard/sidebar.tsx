"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Car,
  Mic,
  BarChart3,
  PlusCircle,
  Upload,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Browse Cars", href: "/browse", icon: Car },
  { name: "Voice Search", href: "/voice-search", icon: Mic },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Add Car", href: "/add-car", icon: PlusCircle },
  { name: "Upload CSV", href: "/upload", icon: Upload },
]

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-sidebar transition-all duration-300",
        // Mobile always w-64; desktop respects collapsed state
        collapsed ? "w-64 md:w-16" : "w-64",
        // Mobile: slide in/out; desktop: always visible
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {/* Full logo — always on mobile, hidden on desktop when collapsed */}
          <Link
            href="/"
            onClick={onMobileClose}
            className={cn("flex items-center gap-2", collapsed && "md:hidden")}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">Car Marketplace</span>
          </Link>

          {/* Icon-only logo — desktop collapsed only */}
          <div
            className={cn(
              "hidden h-8 w-8 items-center justify-center rounded-lg bg-primary mx-auto",
              collapsed && "md:flex"
            )}
          >
            <Car className="h-5 w-5 text-primary-foreground" />
          </div>

          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileClose}
            className="md:hidden shrink-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-sidebar-primary")} />
                {/* Text — always on mobile, hidden on desktop when collapsed */}
                <span className={cn(collapsed && "md:hidden")}>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Collapse Button — desktop only */}
        <div className="hidden md:block border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="w-full justify-center"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  )
}
