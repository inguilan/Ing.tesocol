"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  FileText,
  FolderKanban,
  MapPin,
  PackageCheck,
  Plus,
  Printer,
  ShieldCheck,
  Truck,
  Undo2,
  User,
  Zap,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge"
import { EditProjectDialog } from "@/components/projects/edit-project-dialog"
import { PrintRequestModal } from "@/components/material-requests/print-request-modal"
import { downloadRequestPdf } from "@/lib/pdf-download"
import { useStore } from "@/lib/store-context"
import type { MaterialRequest, ProjectStatus } from "@/lib/types"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = String(params.id)
  const { projects, materialRequests, deliveries, returns, updateProject, currentUser, siteReports, addSiteReport } = useStore()

  const project = projects.find((p) => p.id === projectId)
  const [editing, setEditing] = React.useState(false)
  const [selectedRequestForPrint, setSelectedRequestForPrint] = React.useState<MaterialRequest | null>(null)
  const [materialsLeft, setMaterialsLeft] = React.useState("")
  const [materialsReturned, setMaterialsReturned] = React.useState("")
  const [reportNotes, setReportNotes] = React.useState("")

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4">
        <FolderKanban className="size-16 text-muted-foreground opacity-40" />
        <h2 className="text-xl font-bold">Proyecto no encontrado</h2>
        <p className="text-muted-foreground text-sm">El proyecto con ID {projectId} no existe o fue archivado.</p>
        <Button render={<Link href="/projects" />}>Volver a Proyectos</Button>
      </div>
    )
  }

  // Filter requests, deliveries, and returns for this project
  const projectRequests = materialRequests.filter((r) => r.projectId === project.id || r.project === project.name)
  const projectDeliveries = deliveries.filter((d) => d.projectId === project.id || d.project === project.name)
  const projectReturns = returns.filter((r) => r.projectId === project.id || r.project === project.name)
  const projectSiteReports = siteReports.filter((report) => report.projectId === project.id)
  const displayMaterials = project.materials?.length ? project.materials : projectRequests.flatMap((request) => request.itemsList || []).map((item, index) => ({
    id: `${item.materialName}-${index}`,
    code: "PENDIENTE",
    name: item.materialName,
    category: "Material solicitado",
    quantityRequested: Number(item.quantity),
    quantityDelivered: 0,
    quantityOnSite: 0,
    unit: item.unit,
  }))

  // Status progression mapping
  const statusSteps: { key: ProjectStatus; label: string }[] = [
    { key: "planning", label: "1. Inicio / Planificación" },
    { key: "in_progress", label: "2. En Proceso (Obra)" },
    { key: "completed", label: "3. Finalizado" },
  ]

  const currentStepIndex = statusSteps.findIndex((s) => s.key === project.status)

  const handleStepChange = (newStatus: ProjectStatus) => {
    if (currentUser.role !== "engineer") return
    updateProject(project.id, { status: newStatus })
    toast.success(`Estado actualizado a ${newStatus.replace("_", " ").toUpperCase()}`)
  }

  const submitSiteReport = (event: React.FormEvent) => {
    event.preventDefault()
    if (!materialsLeft.trim() && !materialsReturned.trim()) return toast.error("Indica los materiales que quedan o los que regresan a bodega.")
    addSiteReport({ projectId: project.id, project: project.name, materialsLeft, materialsReturned, notes: reportNotes })
    setMaterialsLeft(""); setMaterialsReturned(""); setReportNotes("")
    toast.success("Reporte de materiales enviado al ingeniero.")
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" render={<Link href="/projects" />}>
          <ArrowLeft className="mr-1 size-4" />
          Volver a Proyectos
        </Button>
        <div className="flex items-center gap-2">
          {currentUser.role === "engineer" && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Edit className="mr-1.5 size-4" />
              Editar Proyecto
            </Button>
          )}
          {currentUser.role === "engineer" && <Button size="sm" render={<Link href="/material-requests/new" />}><Plus className="mr-1.5 size-4" />Nueva Solicitud de Material</Button>}
        </div>
      </div>

      {/* Project Header Banner */}
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-muted-foreground font-semibold px-2 py-0.5 rounded bg-muted">
                {project.id}
              </span>
              <PriorityBadge priority={project.priority} />
              <StatusBadge status={project.status} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-muted-foreground text-sm flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
              <span className="flex items-center gap-1"><Building2 className="size-3.5" /> {project.client}</span>
              <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {project.location}</span>
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 bg-muted/40 p-3 rounded-lg border sm:justify-start sm:gap-4">
            <div className="text-center px-3">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Capacidad</span>
              <span className="text-lg font-bold text-amber-500 flex items-center gap-1">
                <Zap className="size-4" /> {project.capacityKw} kW
              </span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center px-3">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Ingeniero Obra</span>
              <span className="text-sm font-semibold flex items-center gap-1">
                <User className="size-3.5" /> {project.engineer}
              </span>
            </div>
          </div>
        </div>

        {/* Project Progress Steps: Inicio -> Proceso -> Fin */}
        <div className="pt-4 border-t">
          <span className="text-xs font-semibold text-muted-foreground block mb-2">Avance de la Obra:</span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {statusSteps.map((step, idx) => {
              const isActive = project.status === step.key
              const isPast = currentStepIndex > idx
              return (
                <button
                  key={step.key}
                  onClick={() => handleStepChange(step.key)}
                  disabled={currentUser.role !== "engineer"}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-lg text-xs font-semibold border transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : isPast
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-muted/30 text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {isPast || isActive ? <CheckCircle2 className="size-4" /> : <Clock className="size-4" />}
                  {step.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="materials" className="space-y-4">
        <TabsList className="flex h-auto w-full flex-col gap-1 bg-muted/60 p-1 sm:grid sm:grid-cols-3 md:w-auto">
          <TabsTrigger value="materials" className="gap-2">
            <PackageCheck className="size-4" />
            Materiales en Sitio ({displayMaterials.length})
          </TabsTrigger>
          {currentUser.role === "engineer" && <TabsTrigger value="requests" className="gap-2">
            <FileText className="size-4" />
            Solicitudes de Bodega ({projectRequests.length})
          </TabsTrigger>}
          <TabsTrigger value="returns" className="gap-2">
            <Undo2 className="size-4" />
            Reporte tecnico ({projectSiteReports.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Materials on site */}
        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Inventario de Materiales Asignados a la Obra</CardTitle>
                <CardDescription>
                  Material solicitado para {project.name}. Se actualiza cuando el tecnico reporta el material que queda en sitio.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0 sm:p-6">
              <Table className="min-w-220">
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Material / Descripción</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-center">Solicitado</TableHead>
                    <TableHead className="text-center">Entregado</TableHead>
                    <TableHead className="text-center">En Sitio (Bodega Obra)</TableHead>
                    <TableHead className="text-right">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayMaterials.map((mat) => (
                    <TableRow key={mat.id}>
                      <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                        {mat.code}
                      </TableCell>
                      <TableCell className="font-medium">{mat.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{mat.category}</Badge>
                      </TableCell>
                      <TableCell className="text-center font-semibold">{mat.quantityRequested} {mat.unit}</TableCell>
                      <TableCell className="text-center text-blue-600 dark:text-blue-400 font-semibold">
                        {mat.quantityDelivered} {mat.unit}
                      </TableCell>
                      <TableCell className="text-center font-bold text-emerald-600 dark:text-emerald-400">
                        {mat.quantityOnSite} {mat.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        {mat.quantityDelivered === 0 ? (
                          <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 border-amber-500/30">Pendiente de entrega</Badge>
                        ) : mat.quantityOnSite >= mat.quantityRequested ? (
                          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">Completo</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 border-amber-500/30">En Tránsito</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Material Requests */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Solicitudes de Materiales para Bodega</CardTitle>
                <CardDescription>
                  Requisiciones generadas para este proyecto. Imprime el PDF para pasar al encargado de bodega.
                </CardDescription>
              </div>
              <Button size="sm" render={<Link href="/material-requests/new" />}>
                <Plus className="mr-1.5 size-4" /> Crear Solicitud
              </Button>
            </CardHeader>
            <CardContent>
              {projectRequests.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm space-y-2">
                  <p>No se han registrado solicitudes de materiales aún para este proyecto.</p>
                  <Button variant="outline" size="sm" render={<Link href="/material-requests/new" />}>
                    Generar Primera Solicitud
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referencia</TableHead>
                      <TableHead>Solicitante</TableHead>
                      <TableHead className="text-center">Ítems</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Vale Bodega</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-mono font-bold text-primary">{req.reference}</TableCell>
                        <TableCell>{req.requestedBy}</TableCell>
                        <TableCell className="text-center font-semibold">{req.itemsCount || req.items}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{req.date}</TableCell>
                        <TableCell>
                          <StatusBadge status={req.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10"
                            onClick={() => downloadRequestPdf(req)}
                          >
                            <Printer className="size-3.5" />
                            Descargar PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Returns */}
        <TabsContent value="returns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Devoluciones de Materiales de Obra</CardTitle>
              <CardDescription>
                Registro de excedentes o ítems devueltos al almacén general.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {currentUser.role === "technician" && (
                  <form onSubmit={submitSiteReport} className="space-y-4 rounded-lg border bg-muted/20 p-4">
                    <div><h3 className="font-semibold">Acta de materiales de obra</h3><p className="text-sm text-muted-foreground">Registra al terminar la visita que queda en el sitio y lo que se debe llevar nuevamente a bodega.</p></div>
                    <div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><label className="text-sm font-medium">Materiales que quedan en sitio</label><textarea value={materialsLeft} onChange={(event) => setMaterialsLeft(event.target.value)} className="min-h-32 w-full rounded-md border bg-card p-3 text-sm" placeholder="Ej: 20 paneles, 100 m de cable..." /></div><div className="space-y-2"><label className="text-sm font-medium">Materiales que regresan a bodega</label><textarea value={materialsReturned} onChange={(event) => setMaterialsReturned(event.target.value)} className="min-h-32 w-full rounded-md border bg-card p-3 text-sm" placeholder="Ej: 2 cajas de conectores, 50 m de cable..." /></div></div>
                    <textarea value={reportNotes} onChange={(event) => setReportNotes(event.target.value)} className="min-h-20 w-full rounded-md border bg-card p-3 text-sm" placeholder="Observaciones (opcional)" />
                    <div className="flex justify-end"><Button type="submit">Enviar reporte al ingeniero</Button></div>
                  </form>
                )}
                <div className="space-y-3"><h3 className="font-semibold">Reportes enviados por el tecnico lider</h3>{projectSiteReports.length === 0 ? <p className="py-5 text-center text-sm text-muted-foreground">Aun no hay reporte de materiales para esta obra.</p> : projectSiteReports.map((report) => <div key={report.id} className="rounded-lg border p-4 text-sm"><div className="mb-3 flex justify-between gap-4"><span className="font-semibold">{report.technician}</span><span className="text-muted-foreground">{report.date}</span></div><p><span className="font-medium">Queda en sitio:</span> {report.materialsLeft || "No reportado"}</p><p className="mt-2"><span className="font-medium">Regresa a bodega:</span> {report.materialsReturned || "No reportado"}</p>{report.notes && <p className="mt-2 text-muted-foreground">{report.notes}</p>}</div>)}</div>
              </div>
              {false ? (
                <p className="py-6 text-center text-muted-foreground text-sm">
                  Sin devoluciones registradas para {project.name}.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referencia</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead className="text-center">Ítems Devueltos</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectReturns.map((ret) => (
                      <TableRow key={ret.id}>
                        <TableCell className="font-mono font-bold">{ret.reference}</TableCell>
                        <TableCell>{ret.reason}</TableCell>
                        <TableCell className="text-center font-semibold">{ret.items}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{ret.date}</TableCell>
                        <TableCell className="text-right">
                          <StatusBadge status={ret.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <EditProjectDialog
        project={project}
        open={editing}
        onOpenChange={setEditing}
      />

      {/* Print PDF Modal */}
      <PrintRequestModal
        request={selectedRequestForPrint}
        open={selectedRequestForPrint !== null}
        onOpenChange={(open) => !open && setSelectedRequestForPrint(null)}
      />
    </div>
  )
}
