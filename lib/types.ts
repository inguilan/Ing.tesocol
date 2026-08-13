export type ProjectStatus =
  | "planning"
  | "in_progress"
  | "on_hold"
  | "completed"
  | "cancelled"

export type RequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "fulfilled"

export type DeliveryStatus =
  | "scheduled"
  | "in_transit"
  | "delivered"
  | "delayed"

export type ReturnStatus = "requested" | "in_review" | "received" | "closed"

export type Priority = "low" | "medium" | "high" | "urgent"

export type UserRole = "engineer" | "technician"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  initials: string
  avatar?: string
}

export interface ProjectMaterial {
  id: string
  code: string
  name: string
  category: string
  quantityRequested: number
  quantityDelivered: number
  quantityOnSite: number
  unit: string
}

export interface Project {
  id: string
  name: string
  client: string
  location: string
  status: ProjectStatus
  engineer: string
  engineerInitials: string
  technician?: string
  priority: Priority
  createdDate: string
  capacityKw: number
  description?: string
  materials?: ProjectMaterial[]
}

export interface RequestItem {
  id: string
  materialName: string
  quantity: number
  unit: string
  notes?: string
}

export interface MaterialRequest {
  id: string
  reference: string
  projectId: string
  project: string
  requestedBy: string
  requestedByRole?: UserRole
  itemsCount: number
  itemsList?: RequestItem[]
  status: RequestStatus
  priority: Priority
  date: string
  notes?: string
}

export interface Delivery {
  id: string
  reference: string
  projectId?: string
  project: string
  carrier: string
  status: DeliveryStatus
  scheduledDate: string
  items: number
}

export interface ReturnRecord {
  id: string
  reference: string
  projectId?: string
  project: string
  reason: string
  status: ReturnStatus
  items: number
  date: string
}

export interface SiteMaterialReport {
  id: string
  projectId: string
  project: string
  technician: string
  date: string
  materialsLeft: string
  materialsReturned: string
  notes?: string
}

export interface ActivityEvent {
  id: string
  type: "request" | "delivery" | "return" | "project" | "approval"
  title: string
  description: string
  user: string
  time: string
}
