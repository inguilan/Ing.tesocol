"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Bell, LogOut, Search, UserCheck, Shield } from "lucide-react"
import * as React from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { labelMap } from "./nav-config"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store-context"

const notifications = [
  {
    title: "La solicitud SOL-5821 requiere aprobación",
    time: "hace 12 min",
  },
  {
    title: "La entrega ENT-3298 está retrasada",
    time: "hace 1 hora",
  },
  {
    title: "Devolución DEV-2210 agregada para revisión",
    time: "hace 5 horas",
  },
]

export function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, loginAsRole, logout } = useStore()
  const segments = pathname.split("/").filter(Boolean)

  const crumbs = [
    { label: "SolarFlow", href: "/" },
    ...segments.map((segment, index) => ({
      label:
        labelMap[segment] ??
        segment.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
      href: `/${segments.slice(0, index + 1).join("/")}`,
    })),
  ]

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-5" />

      <Breadcrumb className="min-w-0">
        <BreadcrumbList>
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1
            return (
              <React.Fragment key={crumb.href}>
                <BreadcrumbItem className={cn(index === 0 && "hidden sm:flex")}>
                  {isLast ? (
                    <BreadcrumbPage className="truncate font-semibold">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink render={<Link href={crumb.href} />}>
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && (
                  <BreadcrumbSeparator
                    className={cn(index === 0 && "hidden sm:flex")}
                  />
                )}
              </React.Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-3">
        {/* Role Indicator Badge */}
        <Badge 
          variant={currentUser.role === "engineer" ? "default" : "outline"} 
          className="hidden sm:inline-flex gap-1.5 py-1 px-2.5 text-xs font-semibold uppercase tracking-wider"
        >
          <Shield className="size-3.5" />
          {currentUser.role === "engineer" ? "Ingeniero" : "Técnico"}
        </Badge>

        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar proyectos, materiales..."
            className="h-9 w-56 rounded-lg border border-input bg-card pr-3 pl-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 lg:w-72"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="relative" />
            }
          >
            <Bell className="size-4" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
            <span className="sr-only">Notificaciones</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notificaciones
              <Badge variant="secondary">{notifications.length} nuevas</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((n) => (
              <DropdownMenuItem key={n.title} className="flex-col items-start gap-0.5 py-2">
                <span className="text-sm font-medium">{n.title}</span>
                <span className="text-xs text-muted-foreground">{n.time}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-5" />

        {/* User Account Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="relative h-9 gap-2 pl-2 pr-3">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                    {currentUser.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left text-xs hidden sm:flex">
                  <span className="font-semibold leading-tight">{currentUser.name}</span>
                  <span className="text-[10px] text-muted-foreground capitalize">{currentUser.role === 'engineer' ? 'Ingeniero' : 'Técnico'}</span>
                </div>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase tracking-wider">Cambiar Perfil Rápido</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => loginAsRole("engineer")}>
                <UserCheck className="mr-2 size-4 text-blue-500" />
                Modo Ingeniero (Acceso Total)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => loginAsRole("technician")}>
                <UserCheck className="mr-2 size-4 text-amber-500" />
                Modo Técnico (Obras & Materiales)
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => { logout(); router.push("/login") }}>
              <LogOut className="mr-2 size-4" />
              Cerrar sesion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
