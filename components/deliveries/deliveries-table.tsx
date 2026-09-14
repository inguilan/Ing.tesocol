"use client"

import * as React from "react"
import { MoreHorizontal, Pencil, Trash2, Truck } from "lucide-react"

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
import type { Project } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { EditDeliveryDialog } from "@/components/deliveries/edit-delivery-dialog"

export function DeliveriesTable({ data, projects, onStatusChange, onSave, onDelete }: { data: Delivery[]; projects: Project[]; onStatusChange?: (id: string, status: Delivery["status"], details?: Pick<Delivery, "receivedBy" | "receivedDate">) => void; onSave: (id: string, updated: Partial<Omit<Delivery, "id" | "reference">>) => void; onDelete: (id: string) => void }) {
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState("all")
  const [editing, setEditing] = React.useState<Delivery | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<Delivery | null>(null)

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
                <TableHead className="text-right">Estado</TableHead>
                <TableHead className="w-12 pr-6" />
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
                  <TableCell className="text-right">
                    {onStatusChange ? (
                      <select
                        aria-label={`Estado de ${d.reference}`}
                        value={d.status}
                        onChange={(event) => onStatusChange(d.id, event.target.value as Delivery["status"], event.target.value === "delivered" ? { receivedDate: new Date().toISOString().slice(0, 10) } : undefined)}
                        className="h-8 rounded-md border bg-card px-2 text-xs"
                      >
                        <option value="scheduled">Programada</option>
                        <option value="in_transit">En tránsito</option>
                        <option value="delivered">Entregada</option>
                        <option value="delayed">Retrasada</option>
                      </select>
                    ) : <StatusBadge status={d.status} />}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}><MoreHorizontal /><span className="sr-only">Acciones de {d.reference}</span></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditing(d)}><Pencil />Editar entrega</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(d)}><Trash2 />Eliminar entrega</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
      <EditDeliveryDialog delivery={editing} projects={projects} open={editing !== null} onOpenChange={(open) => !open && setEditing(null)} onSave={onSave} />
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar esta entrega?</AlertDialogTitle><AlertDialogDescription>{deleteTarget ? `Se eliminará ${deleteTarget.reference} de forma permanente.` : ""}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction className="bg-destructive/10 text-destructive hover:bg-destructive/20" onClick={() => { if (deleteTarget) onDelete(deleteTarget.id); setDeleteTarget(null) }}>Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
