"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Building2, Check, MapPin, Zap } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { useStore } from "@/lib/store-context"
import type { Priority, ProjectStatus } from "@/lib/types"

export default function NewProjectPage() {
  const router = useRouter()
  const { addProject, currentUser, technicians } = useStore()

  const [name, setName] = React.useState("")
  const [client, setClient] = React.useState("")
  const [location, setLocation] = React.useState("")
  const [capacityKw, setCapacityKw] = React.useState<number>(500)
  const [priority, setPriority] = React.useState<Priority>("medium")
  const [status, setStatus] = React.useState<ProjectStatus>("planning")
  const [engineer, setEngineer] = React.useState(currentUser.name || "Maya Chen")
  const [technicianId, setTechnicianId] = React.useState(technicians[0]?.id || "")
  const [description, setDescription] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const technician = technicians.find((user) => user.id === technicianId)
    if (!name || !client || !location || !technician) {
      toast.error("Completa los datos obligatorios y asigna un técnico líder.")
      return
    }

    const created = addProject({
      name,
      client,
      location,
      capacityKw: Number(capacityKw),
      priority,
      status,
      engineer,
      technicianId: technician.id,
      technician: technician.name,
      description,
    })

    toast.success(`Proyecto ${created.id} creado exitosamente`, {
      description: `${created.name} (${created.client})`,
    })

    router.push(`/projects/${created.id}`)
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" render={<Link href="/projects" />}>
          <ArrowLeft className="mr-1 size-4" />
          Volver a Proyectos
        </Button>
      </div>

      <PageHeader
        title="Crear Nuevo Proyecto Solar"
        description="Registra una nueva obra de instalación fotovoltaica para iniciar el control de materiales."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              Datos Generales del Proyecto
            </CardTitle>
            <CardDescription>
              Información del cliente, ubicación y especificaciones técnicas básicas
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold">Nombre del Proyecto *</label>
              <input
                type="text"
                placeholder="Ej: Parque Solar Ribera Fase 2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3 rounded-md border bg-card text-sm outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold">Cliente / Empresa *</label>
              <input
                type="text"
                placeholder="Ej: Helios Energía S.A."
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="w-full h-10 px-3 rounded-md border bg-card text-sm outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold flex items-center gap-1">
                <MapPin className="size-3.5" /> Ubicación / Ciudad *
              </label>
              <input
                type="text"
                placeholder="Ej: Monterrey, NL"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full h-10 px-3 rounded-md border bg-card text-sm outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold flex items-center gap-1">
                <Zap className="size-3.5 text-amber-500" /> Capacidad Generación (kW) *
              </label>
              <input
                type="number"
                value={capacityKw}
                onChange={(e) => setCapacityKw(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-md border bg-card text-sm outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold">Prioridad Operativa</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full h-10 px-3 rounded-md border bg-card text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold">Estado Inicial</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full h-10 px-3 rounded-md border bg-card text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="planning">Planificación / Inicio</option>
                <option value="in_progress">En curso (En Obra)</option>
                <option value="on_hold">En Pausa</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold">Ingeniero Encargado</label>
              <input
                type="text"
                value={engineer}
                onChange={(e) => setEngineer(e.target.value)}
                className="w-full h-10 px-3 rounded-md border bg-card text-sm outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold">Técnico Líder Asignado *</label>
              <select
                value={technicianId}
                onChange={(e) => setTechnicianId(e.target.value)}
                className="w-full h-10 px-3 rounded-md border bg-card text-sm outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Selecciona un técnico líder</option>
                {technicians.map((technician) => (
                  <option key={technician.id} value={technician.id}>{technician.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold">Notas / Alcance del Proyecto</label>
              <textarea
                rows={3}
                placeholder="Detalles sobre el terreno, fecha límite o especificaciones de inversores..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-md border bg-card text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" render={<Link href="/projects" />}>
            Cancelar
          </Button>
          <Button type="submit" className="font-semibold gap-2">
            <Check className="size-4" />
            Guardar y Crear Proyecto
          </Button>
        </div>
      </form>
    </div>
  )
}
