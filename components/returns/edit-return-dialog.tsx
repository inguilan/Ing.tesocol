"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Project, ReturnRecord, ReturnStatus } from "@/lib/types"

interface EditReturnDialogProps {
  record: ReturnRecord | null
  projects: Project[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (id: string, updated: Partial<Omit<ReturnRecord, "id" | "reference">>) => void
}

export function EditReturnDialog({ record, projects, open, onOpenChange, onSave }: EditReturnDialogProps) {
  const [projectId, setProjectId] = React.useState("")
  const [reason, setReason] = React.useState("")
  const [items, setItems] = React.useState("1")
  const [date, setDate] = React.useState("")
  const [status, setStatus] = React.useState<ReturnStatus>("requested")
  const [condition, setCondition] = React.useState<NonNullable<ReturnRecord["condition"]>>("surplus")
  const [notes, setNotes] = React.useState("")

  React.useEffect(() => {
    if (!record) return
    setProjectId(record.projectId ?? projects.find((project) => project.name === record.project)?.id ?? "")
    setReason(record.reason)
    setItems(String(record.items))
    setDate(record.date)
    setStatus(record.status)
    setCondition(record.condition ?? "surplus")
    setNotes(record.notes ?? "")
  }, [record, projects])

  if (!record) return null
  const currentRecord = record

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const project = projects.find((item) => item.id === projectId)
    const itemCount = Number(items)
    if (!project || !reason.trim() || !date || !Number.isInteger(itemCount) || itemCount < 1) {
      toast.error("Completa obra, motivo, fecha y una cantidad válida.")
      return
    }
    onSave(currentRecord.id, { projectId: project.id, project: project.name, reason: reason.trim(), items: itemCount, date, status, condition, notes: notes.trim() || undefined })
    toast.success(`Devolución ${currentRecord.reference} actualizada`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar devolución {record.reference}</DialogTitle>
          <DialogDescription>Corrige los materiales, el motivo o el estado de recepción.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-2 sm:grid-cols-2">
          <label className="space-y-2 text-sm sm:col-span-2"><span className="font-medium">Proyecto</span><select required value={projectId} onChange={(event) => setProjectId(event.target.value)} className="h-10 w-full rounded-md border bg-card px-3"><option value="">Selecciona la obra</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
          <label className="space-y-2 text-sm"><span className="font-medium">Cantidad</span><input required min="1" step="1" type="number" value={items} onChange={(event) => setItems(event.target.value)} className="h-10 w-full rounded-md border bg-card px-3" /></label>
          <label className="space-y-2 text-sm"><span className="font-medium">Fecha</span><input required type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-10 w-full rounded-md border bg-card px-3" /></label>
          <label className="space-y-2 text-sm"><span className="font-medium">Estado</span><select value={status} onChange={(event) => setStatus(event.target.value as ReturnStatus)} className="h-10 w-full rounded-md border bg-card px-3"><option value="requested">Solicitada</option><option value="in_review">En revisión</option><option value="received">Recibida</option><option value="closed">Cerrada</option></select></label>
          <label className="space-y-2 text-sm"><span className="font-medium">Condición</span><select value={condition} onChange={(event) => setCondition(event.target.value as typeof condition)} className="h-10 w-full rounded-md border bg-card px-3"><option value="surplus">Material excedente</option><option value="good">Buen estado</option><option value="damaged">Dañado</option><option value="incorrect">Especificación incorrecta</option></select></label>
          <label className="space-y-2 text-sm sm:col-span-2"><span className="font-medium">Motivo y materiales</span><textarea required value={reason} onChange={(event) => setReason(event.target.value)} className="min-h-24 w-full rounded-md border bg-card p-3" /></label>
          <label className="space-y-2 text-sm sm:col-span-2"><span className="font-medium">Notas</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="min-h-20 w-full rounded-md border bg-card p-3" /></label>
          <DialogFooter className="sm:col-span-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit">Guardar cambios</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
