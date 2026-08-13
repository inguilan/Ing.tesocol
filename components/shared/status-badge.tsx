import { cn } from "@/lib/utils"

type Tone = "blue" | "green" | "amber" | "red" | "gray" | "violet"

const toneStyles: Record<Tone, string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  gray: "bg-muted text-muted-foreground ring-border",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
}

const dotStyles: Record<Tone, string> = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  gray: "bg-muted-foreground",
  violet: "bg-violet-500",
}

const statusConfig: Record<string, { label: string; tone: Tone }> = {
  // Proyectos
  planning: { label: "Planeación", tone: "blue" },
  in_progress: { label: "En curso", tone: "amber" },
  on_hold: { label: "En pausa", tone: "gray" },
  completed: { label: "Completado", tone: "green" },
  cancelled: { label: "Cancelado", tone: "red" },
  // Solicitudes
  pending: { label: "Pendiente", tone: "amber" },
  approved: { label: "Aprobada", tone: "blue" },
  rejected: { label: "Rechazada", tone: "red" },
  fulfilled: { label: "Surtida", tone: "green" },
  // Entregas
  scheduled: { label: "Programada", tone: "blue" },
  in_transit: { label: "En tránsito", tone: "amber" },
  delivered: { label: "Entregada", tone: "green" },
  delayed: { label: "Retrasada", tone: "red" },
  // Devoluciones
  requested: { label: "Solicitada", tone: "amber" },
  in_review: { label: "En revisión", tone: "blue" },
  received: { label: "Recibida", tone: "violet" },
  closed: { label: "Cerrada", tone: "green" },
}

const priorityConfig: Record<string, { label: string; tone: Tone }> = {
  low: { label: "Baja", tone: "gray" },
  medium: { label: "Media", tone: "blue" },
  high: { label: "Alta", tone: "amber" },
  urgent: { label: "Urgente", tone: "red" },
}

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, tone: "gray" as Tone }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneStyles[config.tone]
      )}
    >
      <span className={cn("size-1.5 rounded-full", dotStyles[config.tone])} />
      {config.label}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: string }) {
  const config = priorityConfig[priority] ?? {
    label: priority,
    tone: "gray" as Tone,
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneStyles[config.tone]
      )}
    >
      {config.label}
    </span>
  )
}
