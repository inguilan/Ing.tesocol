"use client"

import * as React from "react"
import Link from "next/link"
import { Eye, FolderKanban, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PriorityBadge, StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { TableToolbar } from "@/components/shared/table-toolbar"
import { EditProjectDialog } from "@/components/projects/edit-project-dialog"
import { useStore } from "@/lib/store-context"
import type { Project } from "@/lib/types"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 6

export function ProjectsTable({ data: propsData }: { data?: Project[] }) {
  const { projects: storeProjects, deleteProject } = useStore()
  const data = propsData || storeProjects

  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState("all")
  const [priority, setPriority] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [deleteTarget, setDeleteTarget] = React.useState<Project | null>(null)
  const [editingProject, setEditingProject] = React.useState<Project | null>(null)

  const filtered = React.useMemo(() => {
    return data.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.client.toLowerCase().includes(search.toLowerCase()) ||
        project.id.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = status === "all" || project.status === status
      const matchesPriority =
        priority === "all" || project.priority === priority
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [data, search, status, priority])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  React.useEffect(() => {
    setPage(1)
  }, [search, status, priority])

  function confirmDelete() {
    if (deleteTarget) {
      deleteProject(deleteTarget.id)
      toast.success(`Proyecto ${deleteTarget.id} archivado`, {
        description: deleteTarget.name,
      })
      setDeleteTarget(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nombre, cliente o ID..."
        filters={[
          {
            placeholder: "Estado",
            value: status,
            onChange: setStatus,
            options: [
              { label: "Todos los estados", value: "all" },
              { label: "Planeación", value: "planning" },
              { label: "En curso", value: "in_progress" },
              { label: "En pausa", value: "on_hold" },
              { label: "Completado", value: "completed" },
              { label: "Cancelado", value: "cancelled" },
            ],
          },
          {
            placeholder: "Prioridad",
            value: priority,
            onChange: setPriority,
            options: [
              { label: "Todas las prioridades", value: "all" },
              { label: "Urgente", value: "urgent" },
              { label: "Alta", value: "high" },
              { label: "Media", value: "medium" },
              { label: "Baja", value: "low" },
            ],
          },
        ]}
      />

      <Card className="overflow-hidden py-0">
        {paged.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={FolderKanban}
              title="No se encontraron proyectos"
              description="Ajusta la búsqueda o los filtros para encontrar lo que buscas."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Proyecto</TableHead>
                <TableHead className="hidden md:table-cell">Cliente</TableHead>
                <TableHead className="hidden lg:table-cell">Ubicación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden sm:table-cell">Responsables</TableHead>
                <TableHead className="hidden xl:table-cell">Creado</TableHead>
                <TableHead className="w-12 pr-6 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((project) => (
                <TableRow key={project.id} className="group">
                  <TableCell className="pl-6">
                    <div className="flex flex-col">
                      <Link 
                        href={`/projects/${project.id}`}
                        className="font-semibold hover:underline text-primary"
                      >
                        {project.name}
                      </Link>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {project.id}
                        <PriorityBadge priority={project.priority} />
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {project.client}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {project.location}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={project.status} />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 text-sm">
                        <Avatar className="size-6">
                          <AvatarFallback className="bg-accent text-accent-foreground text-[10px]">
                            {project.engineerInitials}
                          </AvatarFallback>
                        </Avatar>
                        {project.engineer}
                      </span>
                      <span className="pl-8 text-xs text-muted-foreground">
                        Técnico: {project.technician ?? "Sin asignar"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-muted-foreground tabular-nums">
                    {new Date(project.createdDate).toLocaleDateString("es-MX", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="opacity-60 group-hover:opacity-100"
                          />
                        }
                      >
                        <MoreHorizontal />
                        <span className="sr-only">Abrir menú</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem render={<Link href={`/projects/${project.id}`} />}>
                            <Eye />
                            Ver detalles y materiales
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingProject(project)}>
                            <Pencil />
                            Editar estado / info
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteTarget(project)}
                        >
                          <Trash2 />
                          Archivar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          Mostrando {paged.length} de {filtered.length} proyectos
        </p>
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <Button
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="icon-sm"
                  className={cn("tabular-nums")}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              </PaginationItem>
            ))}
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Siguiente
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Edit Project Dialog */}
      <EditProjectDialog
        project={editingProject}
        open={editingProject !== null}
        onOpenChange={(open) => !open && setEditingProject(null)}
      />

      {/* Delete / Archive Alert Dialog */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Archivar este proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `"${deleteTarget.name}" se moverá al archivo. Esto no afecta el inventario del almacén.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive/10 text-destructive hover:bg-destructive/20"
            >
              Archivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
