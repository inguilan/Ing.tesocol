"use client"

import * as React from "react"
import { Undo2 } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { TableToolbar } from "@/components/shared/table-toolbar"
import type { ReturnRecord } from "@/lib/types"

export function ReturnsTable({ data }: { data: ReturnRecord[] }) {
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState("all")

  const filtered = data.filter((r) => {
    const matchesSearch =
      r.reference.toLowerCase().includes(search.toLowerCase()) ||
      r.project.toLowerCase().includes(search.toLowerCase()) ||
      r.reason.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = status === "all" || r.status === status
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex flex-col gap-4">
      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar devoluciones..."
        filters={[
          {
            placeholder: "Estado",
            value: status,
            onChange: setStatus,
            options: [
              { label: "Todos los estados", value: "all" },
              { label: "Solicitada", value: "requested" },
              { label: "En revisión", value: "in_review" },
              { label: "Recibida", value: "received" },
              { label: "Cerrada", value: "closed" },
            ],
          },
        ]}
      />
      <Card className="overflow-hidden py-0">
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Undo2}
              title="No se encontraron devoluciones"
              description="Ninguna devolución coincide con los filtros actuales."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Referencia</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead className="hidden md:table-cell">Motivo</TableHead>
                <TableHead className="text-right">Artículos</TableHead>
                <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                <TableHead className="pr-6 text-right">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="pl-6 font-medium">
                    {r.reference}
                  </TableCell>
                  <TableCell className="max-w-48 truncate text-muted-foreground">
                    {r.project}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {r.reason}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.items}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground tabular-nums">
                    {new Date(r.date).toLocaleDateString("es-MX", {
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <StatusBadge status={r.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
