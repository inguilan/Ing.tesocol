import {
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  Truck,
  Undo2,
  type LucideIcon,
} from "lucide-react"

import type { ActivityEvent } from "@/lib/types"
import { cn } from "@/lib/utils"

const iconMap: Record<ActivityEvent["type"], LucideIcon> = {
  request: ClipboardList,
  delivery: Truck,
  return: Undo2,
  project: FolderKanban,
  approval: CheckCircle2,
}

const toneMap: Record<ActivityEvent["type"], string> = {
  request: "bg-blue-50 text-blue-600",
  delivery: "bg-amber-50 text-amber-600",
  return: "bg-violet-50 text-violet-600",
  project: "bg-accent text-accent-foreground",
  approval: "bg-emerald-50 text-emerald-600",
}

export function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  return (
    <ol className="flex flex-col">
      {events.map((event, index) => {
        const Icon = iconMap[event.type]
        const isLast = index === events.length - 1
        return (
          <li key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast && (
              <span
                className="absolute top-9 left-4 h-[calc(100%-1.5rem)] w-px bg-border"
                aria-hidden
              />
            )}
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full",
                toneMap[event.type]
              )}
            >
              <Icon className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5 pt-0.5">
              <p className="text-sm font-medium leading-snug">{event.title}</p>
              <p className="text-xs text-muted-foreground">
                {event.description}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground/70">
                {event.user} · {event.time}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
