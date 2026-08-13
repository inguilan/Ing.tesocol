import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  Truck,
  Undo2,
  BarChart3,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: string
}

export const navItems: NavItem[] = [
  { title: "Panel", href: "/", icon: LayoutDashboard },
  { title: "Proyectos", href: "/projects", icon: FolderKanban },
  {
    title: "Solicitudes de material",
    href: "/material-requests",
    icon: ClipboardList,
    badge: "24",
  },
  { title: "Reportes", href: "/reports", icon: BarChart3 },
]

export const labelMap: Record<string, string> = {
  "": "Panel",
  projects: "Proyectos",
  "material-requests": "Solicitudes de material",
  deliveries: "Entregas",
  returns: "Devoluciones",
  reports: "Reportes",
  new: "Nuevo proyecto",
  settings: "Configuración",
}
