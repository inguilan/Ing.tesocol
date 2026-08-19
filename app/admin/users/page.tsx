"use client"

import * as React from "react"
import { KeyRound, ShieldCheck, UserPlus, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store-context"
import type { UserRole } from "@/lib/types"

const roleLabels: Record<UserRole, string> = {
  superadmin: "Superusuario",
  engineer: "Ingeniero",
  technician: "Técnico líder",
}

export default function UsersAdminPage() {
  const router = useRouter()
  const { currentUser, users, addUser, setUserActive } = useStore()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [role, setRole] = React.useState<Exclude<UserRole, "superadmin">>("technician")

  React.useEffect(() => {
    if (currentUser.role !== "superadmin") router.replace("/")
  }, [currentUser.role, router])

  if (currentUser.role !== "superadmin") return null

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const created = addUser({ name: name.trim(), email: email.trim(), password, role })
    if (!created) {
      toast.error("Ya existe un usuario con ese correo.")
      return
    }
    toast.success("Usuario creado", { description: `${created.name} podrá ingresar con sus credenciales.` })
    setName("")
    setEmail("")
    setPassword("")
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader title="Usuarios y accesos" description="Crea y administra las cuentas de ingenieros y técnicos líderes." />

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="flex gap-3 p-4 text-sm">
          <KeyRound className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <p>Esta versión guarda las cuentas localmente para pruebas. Cuando conectemos Supabase, las contraseñas deberán gestionarse con Supabase Auth y no se almacenarán en el navegador.</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserPlus className="size-5" />Crear usuario</CardTitle>
            <CardDescription>Entrega las credenciales al colaborador por un canal seguro.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">Nombre completo</label><input required value={name} onChange={(event) => setName(event.target.value)} className="h-10 w-full rounded-md border bg-card px-3 text-sm" placeholder="Nombre del colaborador" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Correo</label><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-10 w-full rounded-md border bg-card px-3 text-sm" placeholder="nombre@tesocol.com" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Contraseña temporal</label><input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-10 w-full rounded-md border bg-card px-3 text-sm" placeholder="Mínimo 8 caracteres" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Rol</label><select value={role} onChange={(event) => setRole(event.target.value as typeof role)} className="h-10 w-full rounded-md border bg-card px-3 text-sm"><option value="technician">Técnico líder</option><option value="engineer">Ingeniero</option></select></div>
              <Button type="submit" className="w-full">Crear cuenta</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="size-5" />Cuentas registradas</CardTitle>
            <CardDescription>{users.length} usuarios configurados en este dispositivo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{user.initials}</div><div><p className="font-medium">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p></div></div>
                <div className="flex items-center gap-2"><Badge variant={user.active === false ? "secondary" : "outline"}>{user.active === false ? "Inactivo" : roleLabels[user.role]}</Badge>{user.role !== "superadmin" && <Button variant="outline" size="sm" onClick={() => setUserActive(user.id, user.active === false)}> {user.active === false ? "Activar" : "Desactivar"}</Button>}{user.role === "superadmin" && <ShieldCheck className="size-4 text-red-500" />}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
