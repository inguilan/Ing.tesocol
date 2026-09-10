import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  Truck,
  Undo2,
  BarChart3,
  UserCog,
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
  },
  { title: "Entregas", href: "/deliveries", icon: Truck },
  { title: "Devoluciones", href: "/returns", icon: Undo2 },
  { title: "Reportes", href: "/reports", icon: BarChart3 },
  { title: "Usuarios y accesos", href: "/admin/users", icon: UserCog },
]

export const labelMap: Record<string, string> = {
  "": "Panel",
  projects: "Proyectos",
  "material-requests": "Solicitudes de material",
  deliveries: "Entregas",
  returns: "Devoluciones",
  reports: "Reportes",
  admin: "Administración",
  users: "Usuarios y accesos",
  new: "Nuevo proyecto",
  settings: "Configuración",
}
