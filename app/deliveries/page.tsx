"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Plus, Truck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { DeliveriesTable } from "@/components/deliveries/deliveries-table"
import { useStore } from "@/lib/store-context"

export default function DeliveriesPage() {
  const { deliveries, projects, addDelivery, updateDeliveryStatus, currentUser } = useStore()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [projectId, setProjectId] = React.useState("")
  const [carrier, setCarrier] = React.useState("")
  const [scheduledDate, setScheduledDate] = React.useState("")
  const [items, setItems] = React.useState("1")
  const [notes, setNotes] = React.useState("")
  const canManage = currentUser.role === "engineer" || currentUser.role === "superadmin"
  React.useEffect(() => { if (!canManage) router.replace("/projects") }, [canManage, router])
  if (!canManage) return null
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const project = projects.find((item) => item.id === projectId)
    const itemCount = Number(items)
    if (!project || !carrier.trim() || !scheduledDate || !Number.isInteger(itemCount) || itemCount < 1) return toast.error("Completa proyecto, transportista, fecha y una cantidad válida.")
    const delivery = addDelivery({ projectId, project: project.name, carrier: carrier.trim(), scheduledDate, status: "scheduled", items: itemCount, notes: notes.trim() || undefined })
    toast.success(`Entrega ${delivery.reference} programada.`)
    setOpen(false); setProjectId(""); setCarrier(""); setScheduledDate(""); setItems("1"); setNotes("")
  }
  return <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
    <PageHeader title="Entregas" description="Programacion de despachos desde bodega hacia cada obra."><Button onClick={() => setOpen(true)} disabled={!projects.length}><Plus data-icon="inline-start" />Programar entrega</Button></PageHeader>
    {!projects.length && <Card><CardContent className="p-6 text-sm text-muted-foreground">Primero crea una obra para poder programar una entrega.</CardContent></Card>}
    {open && <Card><CardHeader><CardTitle className="text-lg">Nueva entrega</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="grid gap-4 md:grid-cols-2"><select required value={projectId} onChange={(e) => setProjectId(e.target.value)} className="h-10 rounded-md border bg-card px-3 text-sm"><option value="">Selecciona la obra</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select><input required value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="Responsable de bodega o transportista" className="h-10 rounded-md border bg-card px-3 text-sm" /><input required min="1" step="1" type="number" value={items} onChange={(e) => setItems(e.target.value)} placeholder="Cantidad de artículos" className="h-10 rounded-md border bg-card px-3 text-sm" /><input required type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="h-10 rounded-md border bg-card px-3 text-sm" /><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas de preparación o transporte (opcional)" className="min-h-20 rounded-md border bg-card p-3 text-sm md:col-span-2" /><div className="flex justify-end gap-2 md:col-span-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit"><Truck data-icon="inline-start" />Guardar entrega</Button></div></form></CardContent></Card>}
    <DeliveriesTable data={deliveries} onStatusChange={updateDeliveryStatus} />
  </div>
}
