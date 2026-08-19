"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Bell, LogOut, Search, Shield } from "lucide-react"
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { labelMap } from "./nav-config"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store-context"

export function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, logout, projects: allProjects, materialRequests: allRequests, deliveries: allDeliveries, returns: allReturns } = useStore()
  const [searchQuery, setSearchQuery] = React.useState("")
  const segments = pathname.split("/").filter(Boolean)
  const projects = currentUser.role === "engineer" ? allProjects : allProjects.filter((project) => project.technicianId === currentUser.id)
  const projectMatches = (projectId?: string, projectName?: string) => currentUser.role === "engineer" || projects.some((project) => project.id === projectId || project.name === projectName)
  const materialRequests = allRequests.filter((request) => projectMatches(request.projectId, request.project))
  const deliveries = allDeliveries.filter((delivery) => projectMatches(delivery.projectId, delivery.project))
  const returns = allReturns.filter((returnRecord) => projectMatches(returnRecord.projectId, returnRecord.project))

  const searchResults = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return []

    return [
      ...projects.map((project) => ({
        id: project.id,
        label: project.name,
        detail: `${project.id} · ${project.client}`,
        href: `/projects/${project.id}`,
      })),
      ...materialRequests.map((request) => ({
        id: request.reference,
        label: request.reference,
        detail: `${request.project} · Solicitud de materiales`,
        href: "/material-requests",
      })),
      ...deliveries.map((delivery) => ({
        id: delivery.reference,
        label: delivery.reference,
        detail: `${delivery.project} · Entrega`,
        href: "/deliveries",
      })),
      ...returns.map((returnRecord) => ({
        id: returnRecord.reference,
        label: returnRecord.reference,
        detail: `${returnRecord.project} · Devolución`,
        href: "/returns",
      })),
    ].filter((result) => `${result.id} ${result.label} ${result.detail}`.toLowerCase().includes(query)).slice(0, 6)
  }, [deliveries, materialRequests, projects, returns, searchQuery])

  const notifications = [
    ...materialRequests.filter((request) => request.status === "pending").map((request) => ({
      title: `${request.reference} requiere aprobación`,
      time: `Solicitud para ${request.project}`,
      href: "/material-requests",
    })),
    ...deliveries.filter((delivery) => delivery.status === "delayed").map((delivery) => ({
      title: `${delivery.reference} está retrasada`,
      time: `Entrega para ${delivery.project}`,
      href: "/deliveries",
    })),
    ...returns.filter((returnRecord) => returnRecord.status === "in_review").map((returnRecord) => ({
      title: `${returnRecord.reference} está en revisión`,
      time: `Devolución de ${returnRecord.project}`,
      href: "/returns",
    })),
  ].slice(0, 8)

  const crumbs = [
    { label: "TESOCOL", href: "/" },
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
          {currentUser.role === "superadmin" ? "Superusuario" : currentUser.role === "engineer" ? "Ingeniero" : "Técnico"}
        </Badge>

        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar proyectos, materiales..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && searchResults[0]) {
                router.push(searchResults[0].href)
                setSearchQuery("")
              }
            }}
            className="h-9 w-56 rounded-lg border border-input bg-card pr-3 pl-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 lg:w-72"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-11 right-0 left-0 z-50 overflow-hidden rounded-lg border bg-popover p-1 shadow-lg">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  className="flex w-full flex-col items-start rounded-md px-3 py-2 text-left hover:bg-muted"
                  onClick={() => {
                    router.push(result.href)
                    setSearchQuery("")
                  }}
                >
                  <span className="text-sm font-medium">{result.label}</span>
                  <span className="text-xs text-muted-foreground">{result.detail}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="relative" />
            }
          >
            <Bell className="size-4" />
            {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />}
            <span className="sr-only">Notificaciones</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notificaciones
              <Badge variant="secondary">{notifications.length} nuevas</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 && (
              <DropdownMenuItem disabled>No hay alertas pendientes</DropdownMenuItem>
            )}
            {notifications.map((n) => (
              <DropdownMenuItem key={n.title} className="flex-col items-start gap-0.5 py-2" onClick={() => router.push(n.href)}>
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
                  <span className="text-[10px] text-muted-foreground capitalize">{currentUser.role === 'superadmin' ? 'Superusuario' : currentUser.role === 'engineer' ? 'Ingeniero' : 'Técnico'}</span>
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
