"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, FilePlus, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { PrintRequestModal } from "@/components/material-requests/print-request-modal"
import { useStore } from "@/lib/store-context"
import type { MaterialRequest, Priority } from "@/lib/types"

interface ItemInput {
  materialName: string
  quantity: number
  unit: string
  notes?: string
}

export default function NewMaterialRequestPage() {
  const router = useRouter()
  const { projects, addMaterialRequest, currentUser } = useStore()

  const [projectId, setProjectId] = React.useState(projects[0]?.id || "")
  const [priority, setPriority] = React.useState<Priority>("medium")
  const [notes, setNotes] = React.useState("")
  const [createdRequestForPrint, setCreatedRequestForPrint] = React.useState<MaterialRequest | null>(null)

  React.useEffect(() => { if (currentUser.role !== "engineer") router.replace("/projects") }, [currentUser.role, router])
  if (currentUser.role !== "engineer") return null

  const [items, setItems] = React.useState<ItemInput[]>([
    { materialName: "Panel Solar Monocristalino 550W", quantity: 20, unit: "piezas", notes: "Serie Principal" },
    { materialName: "Inversor Central Trifásico 50kW", quantity: 2, unit: "unidades", notes: "Urgente" },
  ])

  React.useEffect(() => {
    setItems([{ materialName: "", quantity: 1, unit: "piezas", notes: "" }])
  }, [])

  const handleAddItem = () => {
    setItems((prev) => [...prev, { materialName: "", quantity: 1, unit: "piezas", notes: "" }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toast.error("Debes incluir al menos un material en la solicitud.")
      return
    }
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof ItemInput, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedProject = projects.find((p) => p.id === projectId)
    if (!selectedProject) {
      toast.error("Selecciona un proyecto válido.")
      return
    }

    const validItems = items.filter((item) => item.materialName.trim().length > 0)
    if (validItems.length === 0) {
      toast.error("Ingresa el nombre de al menos un material.")
      return
    }

    const created = addMaterialRequest({
      projectId: selectedProject.id,
      project: selectedProject.name,
      requestedBy: currentUser.name,
      status: "pending",
      priority,
      itemsList: validItems,
      notes,
    })

    toast.success(`Solicitud ${created.reference} creada exitosamente`, {
      description: `Para el proyecto ${created.project}`,
    })

    setCreatedRequestForPrint(created)
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" render={<Link href="/material-requests" />}>
          <ArrowLeft className="mr-1 size-4" />
          Volver a Solicitudes
        </Button>
      </div>

      <PageHeader
        title="Nueva Solicitud de Materiales (Bodega)"
        description="Genera una requisición oficial de insumos para despachar a la obra de instalación solar."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FilePlus className="size-5 text-primary" />
              Información de la Solicitud
            </CardTitle>
            <CardDescription>Selecciona el proyecto de destino y la prioridad</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold">Proyecto Destino *</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full h-10 px-3 rounded-md border bg-card text-sm outline-none focus:ring-2 focus:ring-primary"
                required
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} — {p.name} ({p.client})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold">Solicitante</label>
              <input
                type="text"
                value={currentUser.name}
                disabled
                className="w-full h-10 px-3 rounded-md border bg-muted text-sm outline-none cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold">Prioridad Requisición</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full h-10 px-3 rounded-md border bg-card text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="low">Baja (Programada)</option>
                <option value="medium">Media (Normal)</option>
                <option value="high">Alta (Requerida en 24h)</option>
                <option value="urgent">Urgente (Obra Detenida)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Items Table */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Materiales Solicitados</CardTitle>
              <CardDescription>Agrega los paneles, inversores o insumos necesarios</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="gap-1.5">
              <Plus className="size-4" /> Agregar Ítem
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 rounded-lg border bg-muted/20">
                <div className="col-span-12 md:col-span-5 space-y-1">
                  <label className="text-[11px] text-muted-foreground font-semibold">Material / Descripción</label>
                  <input
                    type="text"
                    placeholder="Ej: Panel Solar 550W / Cable Solar 6mm"
                    value={item.materialName}
                    onChange={(e) => handleItemChange(index, "materialName", e.target.value)}
                    className="w-full h-9 px-3 rounded border bg-card text-sm outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="col-span-4 md:col-span-2 space-y-1">
                  <label className="text-[11px] text-muted-foreground font-semibold">Cantidad</label>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                    className="w-full h-9 px-3 rounded border bg-card text-sm outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="col-span-4 md:col-span-2 space-y-1">
                  <label className="text-[11px] text-muted-foreground font-semibold">Unidad</label>
                  <select
                    value={item.unit}
                    onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                    className="w-full h-9 px-2 rounded border bg-card text-sm outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="piezas">piezas</option>
                    <option value="unidades">unidades</option>
                    <option value="metros">metros</option>
                    <option value="kits">kits</option>
                    <option value="cajas">cajas</option>
                  </select>
                </div>

                <div className="col-span-3 md:col-span-2 space-y-1">
                  <label className="text-[11px] text-muted-foreground font-semibold">Nota</label>
                  <input
                    type="text"
                    placeholder="Lote / Color"
                    value={item.notes || ""}
                    onChange={(e) => handleItemChange(index, "notes", e.target.value)}
                    className="w-full h-9 px-2 rounded border bg-card text-xs outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="col-span-1 flex justify-end pt-4 md:pt-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" render={<Link href="/material-requests" />}>
            Cancelar
          </Button>
          <Button type="submit" className="font-semibold gap-2">
            <Check className="size-4" />
            Crear Solicitud
          </Button>
        </div>
      </form>

      {/* Auto-Open Print Modal upon creation */}
      <PrintRequestModal
        request={createdRequestForPrint}
        open={createdRequestForPrint !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCreatedRequestForPrint(null)
            router.push("/material-requests")
          }
        }}
      />
    </div>
  )
}
