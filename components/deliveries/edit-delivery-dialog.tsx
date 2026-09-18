"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Delivery, DeliveryStatus, Project } from "@/lib/types"

interface EditDeliveryDialogProps {
  delivery: Delivery | null
  projects: Project[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (id: string, updated: Partial<Omit<Delivery, "id" | "reference">>) => void
}

export function EditDeliveryDialog({ delivery, projects, open, onOpenChange, onSave }: EditDeliveryDialogProps) {
  const [projectId, setProjectId] = React.useState("")
  const [carrier, setCarrier] = React.useState("")
  const [scheduledDate, setScheduledDate] = React.useState("")
  const [items, setItems] = React.useState("1")
  const [status, setStatus] = React.useState<DeliveryStatus>("scheduled")
  const [notes, setNotes] = React.useState("")

  React.useEffect(() => {
    if (!delivery) return
    setProjectId(delivery.projectId ?? projects.find((project) => project.name === delivery.project)?.id ?? "")
    setCarrier(delivery.carrier)
    setScheduledDate(delivery.scheduledDate)
    setItems(String(delivery.items))
    setStatus(delivery.status)
    setNotes(delivery.notes ?? "")
  }, [delivery, projects])

  if (!delivery) return null
  const currentDelivery = delivery

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const project = projects.find((item) => item.id === projectId)
    const itemCount = Number(items)
    if (!project || !carrier.trim() || !scheduledDate || !Number.isInteger(itemCount) || itemCount < 1) {
      toast.error("Completa proyecto, transportista, fecha y una cantidad válida.")
      return
    }
    onSave(currentDelivery.id, {
      projectId: project.id,
      project: project.name,
      carrier: carrier.trim(),
      scheduledDate,
      items: itemCount,
      status,
      notes: notes.trim() || undefined,
      receivedDate: status === "delivered" ? (currentDelivery.receivedDate ?? new Date().toISOString().slice(0, 10)) : undefined,
    })
    toast.success(`Entrega ${currentDelivery.reference} actualizada`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar entrega {delivery.reference}</DialogTitle>
          <DialogDescription>Actualiza el despacho, la cantidad y su estado.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-2 sm:grid-cols-2">
          <label className="space-y-2 text-sm sm:col-span-2"><span className="font-medium">Proyecto</span><select required value={projectId} onChange={(event) => setProjectId(event.target.value)} className="h-10 w-full rounded-md border bg-card px-3"><option value="">Selecciona la obra</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
          <label className="space-y-2 text-sm"><span className="font-medium">Transportista</span><input required value={carrier} onChange={(event) => setCarrier(event.target.value)} className="h-10 w-full rounded-md border bg-card px-3" /></label>
          <label className="space-y-2 text-sm"><span className="font-medium">Cantidad</span><input required min="1" step="1" type="number" value={items} onChange={(event) => setItems(event.target.value)} className="h-10 w-full rounded-md border bg-card px-3" /></label>
          <label className="space-y-2 text-sm"><span className="font-medium">Fecha programada</span><input required type="date" value={scheduledDate} onChange={(event) => setScheduledDate(event.target.value)} className="h-10 w-full rounded-md border bg-card px-3" /></label>
          <label className="space-y-2 text-sm"><span className="font-medium">Estado</span><select value={status} onChange={(event) => setStatus(event.target.value as DeliveryStatus)} className="h-10 w-full rounded-md border bg-card px-3"><option value="scheduled">Programada</option><option value="in_transit">En tránsito</option><option value="delivered">Entregada</option><option value="delayed">Retrasada</option></select></label>
          <label className="space-y-2 text-sm sm:col-span-2"><span className="font-medium">Notas</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="min-h-20 w-full rounded-md border bg-card p-3" /></label>
          <DialogFooter className="sm:col-span-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit">Guardar cambios</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
