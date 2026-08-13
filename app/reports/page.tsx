"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Download, FileCheck2, FolderKanban, Layers, MessageSquareText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { StatsCard } from "@/components/shared/stats-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { useStore } from "@/lib/store-context"
import { downloadExecutiveReport } from "@/lib/report-pdf-download"

export default function ReportsPage() {
  const { projects, materialRequests, siteReports, currentUser } = useStore(); const router = useRouter()
  React.useEffect(() => { if (currentUser.role !== "engineer") router.replace("/projects") }, [currentUser.role, router])
  if (currentUser.role !== "engineer") return null
  const active = projects.filter(project => project.status === "in_progress").length
  return <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
    <PageHeader title="Reportes" description="Vista ejecutiva de las obras, solicitudes y actas de materiales."><Button onClick={() => downloadExecutiveReport(projects, materialRequests, siteReports)}><Download data-icon="inline-start" />Descargar reporte PDF</Button></PageHeader>
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4"><StatsCard label="Obras activas" value={active} icon={FolderKanban} hint={`${projects.length} obras registradas`} /><StatsCard label="Solicitudes" value={materialRequests.length} icon={Layers} hint={`${materialRequests.filter(item => item.status === "pending").length} pendientes`} /><StatsCard label="Actas tecnicas" value={siteReports.length} icon={MessageSquareText} hint="recibidas desde obra" /><StatsCard label="Capacidad" value={`${projects.reduce((total, project) => total + project.capacityKw, 0)} kW`} icon={FileCheck2} hint="capacidad planeada" /></div>
    <div className="grid gap-6 xl:grid-cols-5"><Card className="xl:col-span-3"><CardHeader><CardTitle>Estado de obras</CardTitle><CardDescription>Seguimiento consolidado por proyecto.</CardDescription></CardHeader><CardContent>{projects.length === 0 ? <EmptyState icon={FolderKanban} title="Aun no hay obras" description="Crea la primera obra para comenzar el seguimiento." /> : <div className="space-y-3">{projects.map(project => { const requests = materialRequests.filter(item => item.projectId === project.id).length; const reports = siteReports.filter(item => item.projectId === project.id).length; return <div key={project.id} className="rounded-lg border p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{project.name}</p><p className="text-sm text-muted-foreground">{project.client} · {project.location}</p></div><StatusBadge status={project.status} /></div><div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground"><span className="rounded bg-muted px-2 py-1.5">{requests} solicitudes</span><span className="rounded bg-muted px-2 py-1.5">{reports} actas tecnicas</span></div></div> })}</div>}</CardContent></Card><Card className="xl:col-span-2"><CardHeader><CardTitle>Ultimas actas tecnicas</CardTitle><CardDescription>Reportes enviados desde las obras.</CardDescription></CardHeader><CardContent>{siteReports.length === 0 ? <EmptyState icon={MessageSquareText} title="Sin actas aun" description="Las actas enviadas por el tecnico apareceran aqui." /> : <div className="space-y-3">{siteReports.slice(0, 5).map(report => <div key={report.id} className="rounded-lg border p-3"><p className="font-medium text-sm">{report.project}</p><p className="mt-1 text-xs text-muted-foreground">{report.technician} · {report.date}</p><p className="mt-2 text-xs"><span className="font-medium">Regresa:</span> {report.materialsReturned || "Sin devolucion"}</p></div>)}</div>}</CardContent></Card></div>
  </div>
}
