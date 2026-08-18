"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, HardHat, ShieldCheck, Sun, UserCheck, CheckCircle2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStore } from "@/lib/store-context"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const { loginAsRole } = useStore()
  const [role, setRole] = React.useState<"engineer" | "technician">("engineer")
  const [email, setEmail] = React.useState("m.chen@TESOCOL.com")
  const [password, setPassword] = React.useState("123456")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    loginAsRole(role, email)
    toast.success(`¡Bienvenido! Sesión iniciada como ${role === "engineer" ? "Ingeniero" : "Técnico"}`)
    router.push("/")
  }

  const handleQuickLogin = (selectedRole: "engineer" | "technician") => {
    loginAsRole(selectedRole)
    toast.success(`Sesión iniciada como ${selectedRole === "engineer" ? "Ingeniero" : "Técnico"}`)
    router.push("/")
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 md:p-8 bg-muted/20">
      <div className="w-full max-w-md space-y-6">
        {/* Branding Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/25">
            <Sun className="size-8 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">TESOCOL</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Gestión Operativa de Proyectos y Materiales Solares
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border/80 shadow-2xl backdrop-blur-md bg-card">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl font-bold">Acceso al Sistema</CardTitle>
            <CardDescription className="text-xs">
              Ingresa tus credenciales y selecciona tu rol para acceder a las obras y materiales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="engineer" value={role} onValueChange={(v) => {
              const r = v as "engineer" | "technician"
              setRole(r)
              setEmail(r === "engineer" ? "m.chen@TESOCOL.com" : "c.ruiz@TESOCOL.com")
            }} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-3">
                <TabsTrigger value="engineer" className="gap-2 font-semibold">
                  <ShieldCheck className="size-4 text-blue-500" />
                  Ingeniero
                </TabsTrigger>
                <TabsTrigger value="technician" className="gap-2 font-semibold">
                  <HardHat className="size-4 text-amber-500" />
                  Técnico Obra
                </TabsTrigger>
              </TabsList>

              <TabsContent value="engineer">
                <div className="rounded-lg bg-blue-500/10 p-3 text-xs text-blue-700 dark:text-blue-300 border border-blue-500/20 space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <ShieldCheck className="size-3.5" /> Perfil Ingeniero:
                  </p>
                  <p>Crea y edita proyectos solares, aprueba solicitudes y genera vales en PDF para la bodega.</p>
                </div>
              </TabsContent>

              <TabsContent value="technician">
                <div className="rounded-lg bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300 border border-amber-500/20 space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <HardHat className="size-3.5" /> Perfil Técnico de Obra:
                  </p>
                  <p>Visualiza todos los proyectos creados por los ingenieros, consulta materiales en sitio y genera solicitudes.</p>
                </div>
              </TabsContent>
            </Tabs>

            <form onSubmit={handleLogin} className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-primary font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Contraseña</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 px-3 pr-9 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <Button type="submit" className="w-full font-bold h-10 gap-2 mt-2">
                Ingresar al Sistema
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 border-t pt-4 bg-muted/20">
            <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Acceso Directo Sin Contraseña:</span>
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 font-semibold"
                onClick={() => handleQuickLogin("engineer")}
              >
                <UserCheck className="size-3.5 mr-1" />
                Ingeniero Demo
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-semibold"
                onClick={() => handleQuickLogin("technician")}
              >
                <UserCheck className="size-3.5 mr-1" />
                Técnico Demo
              </Button>
            </div>
          </CardFooter>
        </Card>

        <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <CheckCircle2 className="size-3.5 text-emerald-500" />
          Proyectos e Inventario de Materiales sincronizados en tiempo real entre Ingenieros y Técnicos.
        </div>
      </div>
    </div>
  )
}
