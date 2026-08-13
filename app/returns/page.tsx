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
  const { returns, projects, currentUser, addReturn } = useStore()
  const router = useRouter()
  React.useEffect(() => { if (currentUser.role !== "engineer") router.replace("/projects") }, [currentUser.role, router])
  if (currentUser.role !== "engineer") return null
  const [open, setOpen] = React.useState(false); const [projectId, setProjectId] = React.useState(""); const [reason, setReason] = React.useState("")
  const submit = (event: React.FormEvent) => { event.preventDefault(); const project = projects.find(p => p.id === projectId); if (!project || !reason.trim()) return toast.error("Selecciona una obra e indica los materiales que regresan."); const record = addReturn({ projectId, project: project.name, reason, status: "requested", date: new Date().toISOString().slice(0, 10) }); toast.success(`Devolucion ${record.reference} registrada por ${currentUser.name}.`); setOpen(false); setProjectId(""); setReason("") }
  return <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
    <PageHeader title="Devoluciones" description="El tecnico lider reporta los materiales que regresan a bodega."><Button onClick={() => setOpen(true)} disabled={!projects.length}><Plus data-icon="inline-start" />Registrar devolucion</Button></PageHeader>
    {!projects.length && <Card><CardContent className="p-6 text-sm text-muted-foreground">Crea una obra antes de registrar devoluciones.</CardContent></Card>}
    {open && <Card><CardHeader><CardTitle className="text-lg">Reporte de devolucion</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="grid gap-4"><select required value={projectId} onChange={(e) => setProjectId(e.target.value)} className="h-10 rounded-md border bg-card px-3 text-sm"><option value="">Selecciona la obra</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select><textarea required value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Lista de materiales, cantidades y condicion (sobrante, danado, incorrecto)" className="min-h-24 rounded-md border bg-card p-3 text-sm" /><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit"><Undo2 data-icon="inline-start" />Enviar a bodega</Button></div></form></CardContent></Card>}
    <ReturnsTable data={returns} />
  </div>
}
