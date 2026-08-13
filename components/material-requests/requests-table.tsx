"use client"

import * as React from "react"
import { ClipboardList, Printer } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PriorityBadge, StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { TableToolbar } from "@/components/shared/table-toolbar"
import { PrintRequestModal } from "@/components/material-requests/print-request-modal"
import { downloadRequestPdf } from "@/lib/pdf-download"
import { useStore } from "@/lib/store-context"
import type { MaterialRequest } from "@/lib/types"

export function RequestsTable({ data: propsData }: { data?: MaterialRequest[] }) {
  const { materialRequests: storeRequests } = useStore()
  const data = propsData || storeRequests

  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState("all")
  const [selectedRequestForPrint, setSelectedRequestForPrint] = React.useState<MaterialRequest | null>(null)

  const filtered = data.filter((req) => {
    const matchesSearch =
      req.reference.toLowerCase().includes(search.toLowerCase()) ||
      req.project.toLowerCase().includes(search.toLowerCase()) ||
      req.requestedBy.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = status === "all" || req.status === status
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex flex-col gap-4">
      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar solicitudes..."
        filters={[
          {
            placeholder: "Estado",
            value: status,
            onChange: setStatus,
            options: [
              { label: "Todos los estados", value: "all" },
              { label: "Pendiente", value: "pending" },
              { label: "Aprobada", value: "approved" },
              { label: "Surtida", value: "fulfilled" },
              { label: "Rechazada", value: "rejected" },
            ],
          },
        ]}
      />
      <Card className="overflow-hidden py-0">
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={ClipboardList}
              title="No se encontraron solicitudes"
              description="Ninguna solicitud de material coincide con los filtros actuales."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Referencia</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead className="hidden md:table-cell">
                  Solicitado por
                </TableHead>
                <TableHead className="hidden sm:table-cell">Prioridad</TableHead>
                <TableHead className="text-center">Artículos</TableHead>
                <TableHead className="hidden lg:table-cell">Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="pr-6 text-right">Imprimir Vale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="pl-6 font-mono font-bold text-primary">
                    {req.reference}
                  </TableCell>
                  <TableCell className="max-w-48 truncate font-medium">
                    {req.project}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {req.requestedBy}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <PriorityBadge priority={req.priority} />
                  </TableCell>
                  <TableCell className="text-center tabular-nums font-semibold">
                    {req.itemsCount || req.items}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground tabular-nums text-xs">
                    {req.date}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={req.status} />
                  </TableCell>
                  <TableCell className="pr-6 text-right">
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
      </Card>

      {/* Printable PDF Modal */}
      <PrintRequestModal
        request={selectedRequestForPrint}
        open={selectedRequestForPrint !== null}
        onOpenChange={(open) => !open && setSelectedRequestForPrint(null)}
      />
    </div>
  )
}
