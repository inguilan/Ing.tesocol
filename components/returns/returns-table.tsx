"use client"

import * as React from "react"
import { MoreHorizontal, Pencil, Trash2, Undo2 } from "lucide-react"

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
import type { Project } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { EditReturnDialog } from "@/components/returns/edit-return-dialog"

export function ReturnsTable({ data, projects, onStatusChange, onSave, onDelete }: { data: ReturnRecord[]; projects: Project[]; onStatusChange?: (id: string, status: ReturnRecord["status"]) => void; onSave: (id: string, updated: Partial<Omit<ReturnRecord, "id" | "reference">>) => void; onDelete: (id: string) => void }) {
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState("all")
  const [editing, setEditing] = React.useState<ReturnRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<ReturnRecord | null>(null)

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
                <TableHead className="text-right">Estado</TableHead>
                <TableHead className="w-12 pr-6" />
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
                  <TableCell className="text-right">
                    {onStatusChange ? (
                      <select
                        aria-label={`Estado de ${r.reference}`}
                        value={r.status}
                        onChange={(event) => onStatusChange(r.id, event.target.value as ReturnRecord["status"])}
                        className="h-8 rounded-md border bg-card px-2 text-xs"
                      >
                        <option value="requested">Solicitada</option>
                        <option value="in_review">En revisión</option>
                        <option value="received">Recibida</option>
                        <option value="closed">Cerrada</option>
                      </select>
                    ) : <StatusBadge status={r.status} />}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}><MoreHorizontal /><span className="sr-only">Acciones de {r.reference}</span></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditing(r)}><Pencil />Editar devolución</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(r)}><Trash2 />Eliminar devolución</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
      <EditReturnDialog record={editing} projects={projects} open={editing !== null} onOpenChange={(open) => !open && setEditing(null)} onSave={onSave} />
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar esta devolución?</AlertDialogTitle><AlertDialogDescription>{deleteTarget ? `Se eliminará ${deleteTarget.reference} de forma permanente.` : ""}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction className="bg-destructive/10 text-destructive hover:bg-destructive/20" onClick={() => { if (deleteTarget) onDelete(deleteTarget.id); setDeleteTarget(null) }}>Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
