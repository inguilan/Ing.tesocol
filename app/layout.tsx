import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { StoreProvider } from "@/lib/store-context"
import { AppShell } from "@/components/layout/app-shell"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], preload: false })
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
})

export const metadata: Metadata = {
  title: "TESOCOL — Gestión de materiales solares",
  description:
    "Controla el flujo operativo de materiales en proyectos de instalación solar, desde la solicitud hasta el cierre del proyecto.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <StoreProvider>
          <TooltipProvider>
            <AppShell>{children}</AppShell>
          </TooltipProvider>
          <Toaster />
          {process.env.NODE_ENV === "production" && <Analytics />}
        </StoreProvider>
      </body>
    </html>
  )
}
