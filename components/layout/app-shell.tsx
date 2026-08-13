"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppHeader } from "@/components/layout/app-header"
import { useStore } from "@/lib/store-context"

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isLoggedIn } = useStore()
  const isLogin = pathname === "/login"

  React.useEffect(() => {
    if (!isLogin && !isLoggedIn) router.replace("/login")
    if (isLogin && isLoggedIn) router.replace("/")
  }, [isLogin, isLoggedIn, router])

  if (isLogin) return <>{children}</>
  if (!isLoggedIn) return null

  return <SidebarProvider><AppSidebar /><SidebarInset><AppHeader />{children}</SidebarInset></SidebarProvider>
}
