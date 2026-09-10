"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Eye, EyeOff, HardHat, ShieldCheck, Sun, CheckCircle2, Lock, Zap, Wind, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStore } from "@/lib/store-context"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useStore()
  const [role, setRole] = React.useState<"engineer" | "technician">("engineer")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const loggedIn = await login(email, password)
    if (!loggedIn) {
      setIsSubmitting(false)
      toast.error("Credenciales inválidas o usuario inactivo.")
      return
    }
    toast.success("¡Bienvenido! Sesión iniciada correctamente.")
    router.push("/")
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden bg-[#f6f7f8]">
      <div className="flex min-h-10 items-center justify-between bg-[#252525] px-5 py-2 text-[11px] font-semibold text-white sm:px-8 lg:px-12">
        <span>Bienvenidos a TESOCOL, Tecnología Solar de Colombia</span>
        <div className="hidden items-center gap-5 text-white/75 sm:flex"><span className="flex items-center gap-1.5"><Phone className="size-3 text-[#e8662e]" /> +57 (2) 285 9586</span><span className="flex items-center gap-1.5"><Mail className="size-3 text-[#e8662e]" /> info@tesocol.com</span></div>
      </div>

      <div className="relative flex flex-1 items-center justify-center p-0 sm:p-4 md:p-8">
      <div className="relative grid min-h-[620px] w-full max-w-6xl overflow-hidden bg-white shadow-[0_24px_70px_-32px_rgba(15,23,42,0.4)] sm:rounded-[1.75rem] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative hidden min-h-[620px] overflow-hidden bg-[#07566a] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(135deg,transparent_48%,#fff_49%,transparent_50%)] [background-size:26px_26px]" />
          <div className="pointer-events-none absolute -right-28 -top-28 size-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-48 -left-20 size-[34rem] rounded-full border border-white/10" />
          <div>
            <div className="relative z-10 flex animate-[fadeUp_700ms_ease-out_both] items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#e8662e] text-white">
                <Sun className="size-6" />
              </div>
              <div><span className="block text-lg font-black tracking-[0.14em]">TESOCOL</span><span className="block text-[9px] font-medium tracking-[0.18em] text-white/70">TECNOLOGÍA SOLAR DE COLOMBIA</span></div>
            </div>
            <div className="relative z-10 mt-20 max-w-md animate-[fadeUp_700ms_120ms_ease-out_both]">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#ffb28e]">#SomosPuraEnergíaSolar</p>
              <h1 className="text-[2.8rem] font-semibold leading-[1.06] tracking-[-0.04em]">La energía del sol, hecha realidad.</h1>
              <p className="mt-5 max-w-xs text-sm leading-6 text-cyan-50/80">Gestiona cada proyecto solar con precisión, desde la primera solicitud hasta la instalación.</p>
            </div>
          </div>
          <div className="relative z-10 flex animate-[fadeUp_700ms_240ms_ease-out_both] items-center gap-6 border-t border-white/20 pt-5 text-xs text-cyan-50/75">
            <span className="flex items-center gap-2"><Zap className="size-3.5 text-[#ff9b6c]" /><strong className="text-white">100%</strong> renovable</span>
            <span className="flex items-center gap-2"><Wind className="size-3.5 text-[#ff9b6c]" /><strong className="text-white">24/7</strong> en marcha</span>
          </div>

          <div className="pointer-events-none absolute bottom-28 right-20 h-52 w-64 rotate-[-14deg] rounded-lg border-4 border-[#d8eef1] bg-[#164b82] p-2 shadow-2xl shadow-[#063a4b]/40 animate-[floatPanel_6s_ease-in-out_infinite]">
            <div className="grid h-full grid-cols-4 grid-rows-3 gap-1 opacity-80">
              {Array.from({ length: 12 }).map((_, index) => <span key={index} className="rounded-sm border border-cyan-100/40 bg-gradient-to-br from-[#3a9bb2] to-[#164b82]" />)}
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-48 right-28 size-20 rounded-full bg-[#ffc66d] shadow-[0_0_50px_16px_rgba(255,198,109,0.3)] animate-[pulseGlow_4s_ease-in-out_infinite]" />
        </div>

        <div className="p-5 sm:p-8 md:p-10">
          <div className="mb-8 flex animate-[fadeUp_600ms_ease-out_both] items-center gap-3 lg:hidden">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[#e8662e] text-white shadow-lg shadow-orange-900/20"><Sun className="size-6" /></div>
            <div><p className="font-black tracking-[0.14em]">TESOCOL</p><p className="text-[10px] tracking-[0.12em] text-muted-foreground">TECNOLOGÍA SOLAR DE COLOMBIA</p></div>
          </div>

          <Card className="animate-[fadeUp_700ms_100ms_ease-out_both] border-0 bg-transparent shadow-none">
          <CardHeader className="space-y-2 p-0 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Portal operativo</p>
            <CardTitle className="text-[1.75rem] font-bold tracking-tight">Inicia sesión</CardTitle>
            <CardDescription className="text-sm">Accede a tus proyectos y continúa con tu jornada.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 p-0 pt-7">
            <Tabs defaultValue="engineer" value={role} onValueChange={(v) => {
              const r = v as "engineer" | "technician"
              setRole(r)
              setEmail("")
              setPassword("")
            }} className="w-full">
              <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-xl bg-slate-100/80 p-1.5">
                <TabsTrigger value="engineer" className="h-12 gap-2 rounded-lg font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">
                  <ShieldCheck className="size-4 text-blue-500" />
                  Ingeniero
                </TabsTrigger>
                <TabsTrigger value="technician" className="h-12 gap-2 rounded-lg font-semibold data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-sm">
                  <HardHat className="size-4 text-amber-500" />
                  Técnico Obra
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleLogin} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@tesocol.com"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 pl-10 pr-11 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                    required
                  />
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="group mt-2 h-11 w-full gap-2 rounded-xl font-bold shadow-lg shadow-primary/20 transition hover:-translate-y-0.5">
                {isSubmitting ? "Verificando..." : "Ingresar al sistema"}
                {!isSubmitting && <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="mt-7 border-t p-0 pt-5 text-center text-xs text-muted-foreground">
            El acceso se realiza con las credenciales asignadas por el administrador.
          </CardFooter>
        </Card>
        </div>
      </div>

      <div className="absolute bottom-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <CheckCircle2 className="size-3.5 text-emerald-500" />
          Conexión protegida y disponible
      </div>
    </div>
    </div>
  )
}
