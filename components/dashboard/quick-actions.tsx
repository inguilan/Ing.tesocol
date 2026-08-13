"use client"

import Link from "next/link"
import { ClipboardList, FolderPlus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store-context"

const actions = [
  { label: "Crear proyecto", description: "Iniciar una instalacion", href: "/projects/new", icon: FolderPlus },
  { label: "Nueva solicitud", description: "Pedir material para una obra", href: "/material-requests/new", icon: ClipboardList },
]

export function QuickActions() {
  const { currentUser } = useStore()
  if (currentUser.role !== "engineer") return null
  return <Card><CardHeader><CardTitle>Acciones rapidas</CardTitle></CardHeader><CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">{actions.map(action => <Link key={action.label} href={action.href} className="group flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-primary/30 hover:bg-accent/60"><div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><action.icon className="size-4.5" /></div><div className="flex flex-col"><span className="text-sm font-medium">{action.label}</span><span className="text-xs text-muted-foreground">{action.description}</span></div></Link>)}</CardContent></Card>
}
