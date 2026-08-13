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
  const { deliveries, projects, addDelivery, currentUser } = useStore()
  const router = useRouter()
  React.useEffect(() => { if (currentUser.role !== "engineer") router.replace("/projects") }, [currentUser.role, router])
  if (currentUser.role !== "engineer") return null
  const [open, setOpen] = React.useState(false)
  const [projectId, setProjectId] = React.useState("")
  const [carrier, setCarrier] = React.useState("")
  const [scheduledDate, setScheduledDate] = React.useState("")
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const project = projects.find((item) => item.id === projectId)
    if (!project || !carrier.trim() || !scheduledDate) return toast.error("Completa proyecto, transportista y fecha.")
    const delivery = addDelivery({ projectId, project: project.name, carrier, scheduledDate, status: "scheduled" })
    toast.success(`Entrega ${delivery.reference} programada.`)
    setOpen(false); setProjectId(""); setCarrier(""); setScheduledDate("")
  }
  return <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
    <PageHeader title="Entregas" description="Programacion de despachos desde bodega hacia cada obra."><Button onClick={() => setOpen(true)} disabled={!projects.length}><Plus data-icon="inline-start" />Programar entrega</Button></PageHeader>
    {!projects.length && <Card><CardContent className="p-6 text-sm text-muted-foreground">Primero crea una obra para poder programar una entrega.</CardContent></Card>}
    {open && <Card><CardHeader><CardTitle className="text-lg">Nueva entrega</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="grid gap-4 md:grid-cols-3"><select required value={projectId} onChange={(e) => setProjectId(e.target.value)} className="h-10 rounded-md border bg-card px-3 text-sm"><option value="">Selecciona la obra</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select><input required value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="Responsable de bodega o transportista" className="h-10 rounded-md border bg-card px-3 text-sm" /><input required type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="h-10 rounded-md border bg-card px-3 text-sm" /><div className="md:col-span-3 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit"><Truck data-icon="inline-start" />Guardar entrega</Button></div></form></CardContent></Card>}
    <DeliveriesTable data={deliveries} />
  </div>
}
