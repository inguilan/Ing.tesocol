"use client"

import Link from "next/link"
import {
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  Plus,
  MessageSquareText,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { StatsCard } from "@/components/shared/stats-card"
import { ActivityTimeline } from "@/components/shared/activity-timeline"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentProjects } from "@/components/dashboard/recent-projects"
import { RecentRequests } from "@/components/dashboard/recent-requests"
import { useStore } from "@/lib/store-context"

export default function DashboardPage() {
  const { projects: allProjects, materialRequests: allRequests, siteReports: allReports, activity, currentUser } = useStore()
  const canManage = currentUser.role === "engineer" || currentUser.role === "superadmin"
  const projects = canManage ? allProjects : allProjects.filter((project) => project.technicianId === currentUser.id)
  const materialRequests = canManage ? allRequests : allRequests.filter((request) => projects.some((project) => project.id === request.projectId || project.name === request.project))
  const siteReports = canManage ? allReports : allReports.filter((report) => projects.some((project) => project.id === report.projectId))

  const pendingRequestsCount = materialRequests.filter((r) => r.status === "pending").length
  const inProgressProjectsCount = projects.filter((p) => p.status === "in_progress").length
  const completedProjectsCount = projects.filter((p) => p.status === "completed").length

  const dynamicKpis = [
    {
      label: "Solicitudes pendientes",
      value: pendingRequestsCount,
      change: "+12%",
      trend: "up" as const,
      hint: "por aprobar",
      key: "pending-requests",
      icon: ClipboardList,
    },
    {
      label: "Proyectos en curso",
      value: inProgressProjectsCount,
      change: "+3",
      trend: "up" as const,
      hint: "obras activas",
      key: "in-progress",
      icon: FolderKanban,
    },
    {
      label: "Actas tecnicas",
      value: siteReports.length,
      change: "-2",
      trend: "up" as const,
      hint: "en revisión",
      key: "site-reports",
      icon: MessageSquareText,
    },
    {
      label: "Proyectos completados",
      value: completedProjectsCount,
      change: "+8%",
      trend: "up" as const,
      hint: "obras finalizadas",
      key: "completed",
      icon: CheckCircle2,
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader
        title="Panel Principal"
        description={`Vista operativa del flujo de materiales (${canManage ? 'Acceso Total' : 'Proyectos Asignados'}).`}
      >
        <Button
          variant="outline"
          render={<Link href="/material-requests/new" />}
        >
          Nueva solicitud
        </Button>
        {canManage && (
          <Button render={<Link href="/projects/new" />}>
            <Plus data-icon="inline-start" />
            Crear proyecto
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dynamicKpis.map((kpi) => (
          <StatsCard
            key={kpi.key}
            label={kpi.label}
            value={kpi.value}
            change={kpi.change}
            trend={kpi.trend}
            hint={kpi.hint}
            icon={kpi.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <RecentRequests />
          <RecentProjects />
        </div>
        <div className="flex flex-col gap-6">
          <QuickActions />
          <Card>
            <CardHeader>
              <CardTitle>Actividad reciente</CardTitle>
              <CardDescription>Últimos eventos del flujo</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityTimeline events={activity} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
