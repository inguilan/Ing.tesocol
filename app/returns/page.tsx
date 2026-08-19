"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Plus, Undo2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { ReturnsTable } from "@/components/returns/returns-table"
import { useStore } from "@/lib/store-context"

export default function ReturnsPage() {
  const { returns, projects, currentUser, addReturn, updateReturnStatus } = useStore()
  const router = useRouter()
  const [open, setOpen] = React.useState(false); const [projectId, setProjectId] = React.useState(""); const [reason, setReason] = React.useState(""); const [items, setItems] = React.useState("1"); const [condition, setCondition] = React.useState<"good" | "damaged" | "incorrect" | "surplus">("surplus"); const [notes, setNotes] = React.useState("")
  const canManage = currentUser.role === "engineer" || currentUser.role === "superadmin"
  React.useEffect(() => { if (!canManage) router.replace("/projects") }, [canManage, router])
  if (!canManage) return null
  const submit = (event: React.FormEvent) => { event.preventDefault(); const project = projects.find(p => p.id === projectId); const itemCount = Number(items); if (!project || !reason.trim() || !Number.isInteger(itemCount) || itemCount < 1) return toast.error("Selecciona una obra, indica el motivo y una cantidad válida."); const record = addReturn({ projectId, project: project.name, reason: reason.trim(), items: itemCount, condition, notes: notes.trim() || undefined, status: "requested", date: new Date().toISOString().slice(0, 10) }); toast.success(`Devolución ${record.reference} registrada por ${currentUser.name}.`); setOpen(false); setProjectId(""); setReason(""); setItems("1"); setNotes("") }
  return <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
    <PageHeader title="Devoluciones" description="El tecnico lider reporta los materiales que regresan a bodega."><Button onClick={() => setOpen(true)} disabled={!projects.length}><Plus data-icon="inline-start" />Registrar devolucion</Button></PageHeader>
    {!projects.length && <Card><CardContent className="p-6 text-sm text-muted-foreground">Crea una obra antes de registrar devoluciones.</CardContent></Card>}
    {open && <Card><CardHeader><CardTitle className="text-lg">Reporte de devolución</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="grid gap-4 md:grid-cols-2"><select required value={projectId} onChange={(e) => setProjectId(e.target.value)} className="h-10 rounded-md border bg-card px-3 text-sm md:col-span-2"><option value="">Selecciona la obra</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select><input required min="1" step="1" type="number" value={items} onChange={(e) => setItems(e.target.value)} placeholder="Cantidad de artículos" className="h-10 rounded-md border bg-card px-3 text-sm" /><select value={condition} onChange={(e) => setCondition(e.target.value as typeof condition)} className="h-10 rounded-md border bg-card px-3 text-sm"><option value="surplus">Material excedente</option><option value="good">Buen estado</option><option value="damaged">Dañado</option><option value="incorrect">Especificación incorrecta</option></select><textarea required value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Describe los materiales y el motivo de la devolución" className="min-h-24 rounded-md border bg-card p-3 text-sm md:col-span-2" /><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observaciones adicionales (opcional)" className="min-h-20 rounded-md border bg-card p-3 text-sm md:col-span-2" /><div className="flex justify-end gap-2 md:col-span-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit"><Undo2 data-icon="inline-start" />Enviar a bodega</Button></div></form></CardContent></Card>}
    <ReturnsTable data={returns} onStatusChange={updateReturnStatus} />
  </div>
}
