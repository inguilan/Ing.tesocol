"use client"

import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { ProjectsTable } from "@/components/projects/projects-table"
import { useStore } from "@/lib/store-context"

export default function ProjectsPage() {
  const { projects, currentUser } = useStore()

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader
        title="Proyectos"
        description="Proyectos de instalación solar y el estado de su flujo de materiales."
      >
        {currentUser.role === "engineer" && (
          <Button render={<Link href="/projects/new" />}>
            <Plus data-icon="inline-start" />
            Crear proyecto
          </Button>
        )}
      </PageHeader>
      <ProjectsTable data={projects} />
    </div>
  )
}
