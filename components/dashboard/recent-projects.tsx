"use client"

import Link from "next/link"
import { ArrowUpRight, MapPin } from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/shared/status-badge"
import { useStore } from "@/lib/store-context"

export function RecentProjects() {
  const { projects } = useStore()
  const recent = projects.slice(0, 4)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proyectos recientes</CardTitle>
        <CardDescription>Últimas instalaciones en todas las obras</CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/projects" />}
          >
            Ver todos
            <ArrowUpRight data-icon="inline-end" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {recent.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50 group"
          >
            <Avatar className="size-9 rounded-lg">
              <AvatarFallback className="rounded-lg bg-accent text-accent-foreground text-xs font-bold">
                {project.engineerInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold group-hover:text-primary transition-colors">
                {project.name}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" />
                {project.location} • {project.client}
              </span>
            </div>
            <div className="ml-auto">
              <StatusBadge status={project.status} />
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
