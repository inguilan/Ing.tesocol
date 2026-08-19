"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PriorityBadge, StatusBadge } from "@/components/shared/status-badge"
import { useStore } from "@/lib/store-context"

export function RecentRequests() {
  const { materialRequests: allRequests, projects, currentUser } = useStore()
  const visibleProjects = currentUser.role === "engineer" ? projects : projects.filter((project) => project.technicianId === currentUser.id)
  const materialRequests = currentUser.role === "engineer"
    ? allRequests
    : allRequests.filter((request) => visibleProjects.some((project) => project.id === request.projectId || project.name === request.project))
  const recent = materialRequests.slice(0, 5)

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Solicitudes recientes</CardTitle>
        <CardDescription>
          Últimas solicitudes de material en proyectos activos
        </CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/material-requests" />}
          >
            Ver todas
            <ArrowUpRight data-icon="inline-end" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Referencia</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead className="hidden md:table-cell">Prioridad</TableHead>
              <TableHead className="text-right">Artículos</TableHead>
              <TableHead className="pr-6 text-right">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="pl-6 font-mono font-bold text-primary">
                  {req.reference}
                </TableCell>
                <TableCell className="max-w-44 truncate font-medium">
                  {req.project}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <PriorityBadge priority={req.priority} />
                </TableCell>
                <TableCell className="text-right tabular-nums font-semibold">
                  {req.itemsCount || req.items}
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <StatusBadge status={req.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
