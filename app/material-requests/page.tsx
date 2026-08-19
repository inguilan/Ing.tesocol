"use client"

import Link from "next/link"
import { Plus, ClipboardCheck, ClipboardList, Clock, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { StatsCard } from "@/components/shared/stats-card"
import { RequestsTable } from "@/components/material-requests/requests-table"
import { useStore } from "@/lib/store-context"
import { useRouter } from "next/navigation"
import * as React from "react"

export default function MaterialRequestsPage() {
  const { materialRequests, currentUser } = useStore()
  const router = useRouter()
  const canManage = currentUser.role === "engineer" || currentUser.role === "superadmin"
  React.useEffect(() => { if (!canManage) router.replace("/projects") }, [canManage, router])
  if (!canManage) return null

  const pending = materialRequests.filter((r) => r.status === "pending").length
  const approved = materialRequests.filter(
    (r) => r.status === "approved"
  ).length
  const fulfilled = materialRequests.filter(
    (r) => r.status === "fulfilled"
  ).length
  const rejected = materialRequests.filter(
    (r) => r.status === "rejected"
  ).length

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader
        title="Solicitudes de material"
        description="Solicitudes de materiales requeridos en obras de instalación activas."
      >
        <Button render={<Link href="/material-requests/new" />}>
          <Plus data-icon="inline-start" />
          Nueva solicitud
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard label="Pendientes" value={pending} icon={Clock} hint="por aprobar" />
        <StatsCard label="Aprobadas" value={approved} icon={ClipboardCheck} hint="listas para surtir" />
        <StatsCard label="Surtidas" value={fulfilled} icon={ClipboardList} hint="completadas" />
        <StatsCard label="Rechazadas" value={rejected} icon={XCircle} hint="denegadas" />
      </div>

      <RequestsTable data={materialRequests} />
    </div>
  )
}
