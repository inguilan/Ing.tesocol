"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useStore } from "@/lib/store-context"
import type { Priority, Project, ProjectStatus } from "@/lib/types"

interface EditProjectDialogProps {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProjectDialog({
  project,
  open,
  onOpenChange,
}: EditProjectDialogProps) {
  const { updateProject, technicians } = useStore()
  const [status, setStatus] = React.useState<ProjectStatus>("in_progress")
  const [priority, setPriority] = React.useState<Priority>("medium")
  const [client, setClient] = React.useState("")
  const [location, setLocation] = React.useState("")
  const [capacityKw, setCapacityKw] = React.useState(0)
  const [technicianId, setTechnicianId] = React.useState("")

  React.useEffect(() => {
    if (project) {
      setStatus(project.status)
      setPriority(project.priority)
      setClient(project.client)
      setLocation(project.location)
      setCapacityKw(project.capacityKw)
      setTechnicianId(project.technicianId ?? technicians[0]?.id ?? "")
    }
  }, [project, technicians])

  if (!project) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const technician = technicians.find((user) => user.id === technicianId)
    if (!technician) {
      toast.error("Selecciona un técnico líder.")
      return
    }
    updateProject(project.id, {
      status,
      priority,
      client,
      location,
      capacityKw,
      technicianId: technician.id,
      technician: technician.name,
    })
    toast.success(`Proyecto ${project.id} actualizado`, {
      description: `Estado cambiado a ${status.replace("_", " ").toUpperCase()}`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Proyecto: {project.name}</DialogTitle>
          <DialogDescription>
            Modifica la información básica y el estado operativo del proyecto.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold">Estado del Proyecto</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full h-10 px-3 rounded-md border bg-card text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="planning">Planificación / Inicio</option>
              <option value="in_progress">En Curso (En Obra)</option>
              <option value="on_hold">En Pausa</option>
              <option value="completed">Completado / Finalizado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold">Prioridad</label>
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
              <label className="text-xs font-semibold">Capacidad (kW)</label>
              <input
                type="number"
                value={capacityKw}
                onChange={(e) => setCapacityKw(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-md border bg-card text-sm outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold">Cliente</label>
            <input
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="w-full h-10 px-3 rounded-md border bg-card text-sm outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold">Ubicación</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full h-10 px-3 rounded-md border bg-card text-sm outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold">Técnico Líder Asignado</label>
            <select
              value={technicianId}
              onChange={(e) => setTechnicianId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border bg-card text-sm outline-none focus:ring-2 focus:ring-primary"
              required
            >
              {technicians.map((technician) => (
                <option key={technician.id} value={technician.id}>{technician.name}</option>
              ))}
            </select>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="font-semibold">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
