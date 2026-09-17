import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Project, User } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isProjectAssignedToUser(project: Project, user: User) {
  if (project.technicianId === user.id) return true
  if (!project.technician || !user.name) return false
  return project.technician.trim().toLocaleLowerCase() === user.name.trim().toLocaleLowerCase()
}
