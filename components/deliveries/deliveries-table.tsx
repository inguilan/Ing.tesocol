"use client"

import * as React from "react"
import { Truck } from "lucide-react"

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
import type { Delivery } from "@/lib/types"

export function DeliveriesTable({ data }: { data: Delivery[] }) {
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState("all")

  const filtered = data.filter((d) => {
    const matchesSearch =
      d.reference.toLowerCase().includes(search.toLowerCase()) ||
      d.project.toLowerCase().includes(search.toLowerCase()) ||
      d.carrier.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = status === "all" || d.status === status
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex flex-col gap-4">
      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar entregas..."
        filters={[
          {
            placeholder: "Estado",
            value: status,
            onChange: setStatus,
            options: [
              { label: "Todos los estados", value: "all" },
              { label: "Programada", value: "scheduled" },
              { label: "En tránsito", value: "in_transit" },
              { label: "Entregada", value: "delivered" },
              { label: "Retrasada", value: "delayed" },
            ],
          },
        ]}
      />
      <Card className="overflow-hidden py-0">
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Truck}
              title="No se encontraron entregas"
              description="Ninguna entrega coincide con los filtros actuales."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Referencia</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead className="hidden md:table-cell">Transportista</TableHead>
                <TableHead className="text-right">Artículos</TableHead>
                <TableHead className="hidden sm:table-cell">Programada</TableHead>
                <TableHead className="pr-6 text-right">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="pl-6 font-medium">
                    {d.reference}
                  </TableCell>
                  <TableCell className="max-w-48 truncate text-muted-foreground">
                    {d.project}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {d.carrier}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {d.items}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground tabular-nums">
                    {new Date(d.scheduledDate).toLocaleDateString("es-MX", {
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <StatusBadge status={d.status} />
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
