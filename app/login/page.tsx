"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, HardHat, ShieldCheck, Sun, CheckCircle2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStore } from "@/lib/store-context"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useStore()
  const [role, setRole] = React.useState<"engineer" | "technician">("engineer")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const loggedIn = login(email, password)
    if (!loggedIn) {
      toast.error("Credenciales inválidas o usuario inactivo.")
      return
    }
    toast.success("¡Bienvenido! Sesión iniciada correctamente.")
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
              setEmail("")
              setPassword("")
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
                  <p>Visualiza únicamente los proyectos asignados a tu usuario y registra sus reportes de obra.</p>
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

          <CardFooter className="border-t pt-4 bg-muted/20 text-center text-xs text-muted-foreground">
            El acceso se realiza con las credenciales asignadas por el administrador.
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
