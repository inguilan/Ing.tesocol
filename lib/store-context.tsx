"use client"

import * as React from "react"
import { projects as initialProjects, materialRequests as initialRequests, deliveries as initialDeliveries, returns as initialReturns, activity as initialActivity } from "./data"
import type { Project, MaterialRequest, Delivery, ReturnRecord, ActivityEvent, User, ProjectMaterial, SiteMaterialReport } from "./types"

// Default initial materials for projects
export const sampleMaterials: ProjectMaterial[] = [
  { id: "m1", code: "PAN-550W", name: "Panel Solar Monocristalino 550W", category: "Fotovoltaico", quantityRequested: 100, quantityDelivered: 100, quantityOnSite: 100, unit: "piezas" },
  { id: "m2", code: "INV-50KW", name: "Inversor Central Trifásico 50kW", category: "Electrónica", quantityRequested: 4, quantityDelivered: 4, quantityOnSite: 4, unit: "unidades" },
  { id: "m3", code: "CAB-SOL6", name: "Cable Solar Fotovoltaico 6mm² Rojo/Negro", category: "Cableado", quantityRequested: 500, quantityDelivered: 450, quantityOnSite: 400, unit: "metros" },
  { id: "m4", code: "EST-ALU1", name: "Estructura Aluminio Anodizado p/ Rieles", category: "Estructura", quantityRequested: 50, quantityDelivered: 50, quantityOnSite: 48, unit: "kits" },
  { id: "m5", code: "PRO-CC10", name: "Tablero de Protección CC con Fusibles 1000V", category: "Protecciones", quantityRequested: 2, quantityDelivered: 2, quantityOnSite: 2, unit: "tableros" },
]

export const defaultEngineerUser: User = {
  id: "usr-eng-1",
  name: "Ing. Maya Chen (Ingeniero Principal)",
  email: "m.chen@TESOCOL.com",
  role: "engineer",
  initials: "MC"
}

export const defaultTechnicianUser: User = {
  id: "usr-tech-1",
  name: "Carlos Ruiz (Técnico Obra)",
  email: "c.ruiz@TESOCOL.com",
  role: "technician",
  initials: "CR"
}

interface StoreContextType {
  isLoggedIn: boolean
  currentUser: User
  setCurrentUser: (user: User) => void
  projects: Project[]
  addProject: (project: Omit<Project, "id" | "createdDate" | "engineerInitials">) => Project
  updateProject: (id: string, updated: Partial<Project>) => void
  deleteProject: (id: string) => void
  materialRequests: MaterialRequest[]
  addMaterialRequest: (request: Omit<MaterialRequest, "id" | "reference" | "date" | "itemsCount"> & { itemsList: any[] }) => MaterialRequest
  updateRequestStatus: (id: string, status: MaterialRequest["status"]) => void
  deliveries: Delivery[]
  addDelivery: (delivery: Omit<Delivery, "id" | "reference" | "items">) => Delivery
  returns: ReturnRecord[]
  addReturn: (returnRecord: Omit<ReturnRecord, "id" | "reference" | "items">) => ReturnRecord
  siteReports: SiteMaterialReport[]
  addSiteReport: (report: Omit<SiteMaterialReport, "id" | "date" | "technician">) => SiteMaterialReport
  activity: ActivityEvent[]
  loginAsRole: (role: "engineer" | "technician", email?: string) => void
  logout: () => void
}

const StoreContext = React.createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false)
  const [currentUser, setCurrentUser] = React.useState<User>(defaultEngineerUser)
  
  // Hydrate projects with sample materials
  const [projectsList, setProjectsList] = React.useState<Project[]>(() => {
    return []
  })

  const [requestsList, setRequestsList] = React.useState<MaterialRequest[]>(() => {
    return [] as MaterialRequest[]
    /* return initialRequests.map(r => ({
      ...r,
      itemsCount: r.items,
      itemsList: [
        { id: "i1", materialName: "Panel Solar 550W", quantity: 20, unit: "piezas", notes: "Lote A" },
        { id: "i2", materialName: "Inversor Trifásico 50kW", quantity: 2, unit: "unidades", notes: "Urgente" },
        { id: "i3", materialName: "Cable Solar 6mm²", quantity: 150, unit: "metros", notes: "Color rojo" }
      ]
    })) */
  })

  const [deliveriesList, setDeliveriesList] = React.useState<Delivery[]>([])
  const [returnsList, setReturnsList] = React.useState<ReturnRecord[]>([])
  const [activityList, setActivityList] = React.useState<ActivityEvent[]>([])
  const [siteReportsList, setSiteReportsList] = React.useState<SiteMaterialReport[]>([])

  // Load / Save localStorage state
  React.useEffect(() => {
    try {
      const savedUser = localStorage.getItem("TESOCOL_v2_user")
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser))
        setIsLoggedIn(true)
      }
      const savedAuth = localStorage.getItem("TESOCOL_v2_auth")
      if (savedAuth) {
        setIsLoggedIn(JSON.parse(savedAuth))
      }
      const savedProjects = localStorage.getItem("TESOCOL_v2_projects")
      if (savedProjects) {
        setProjectsList(JSON.parse(savedProjects))
      }
      const savedRequests = localStorage.getItem("TESOCOL_v2_requests")
      if (savedRequests) {
        setRequestsList(JSON.parse(savedRequests))
      }
      const savedDeliveries = localStorage.getItem("TESOCOL_v2_deliveries")
      if (savedDeliveries) setDeliveriesList(JSON.parse(savedDeliveries))
      const savedReturns = localStorage.getItem("TESOCOL_v2_returns")
      if (savedReturns) setReturnsList(JSON.parse(savedReturns))
      const savedReports = localStorage.getItem("TESOCOL_v2_site_reports")
      if (savedReports) setSiteReportsList(JSON.parse(savedReports))
    } catch (e) {
      console.error("Failed loading local storage", e)
    }
  }, [])

  React.useEffect(() => {
    try {
      localStorage.setItem("TESOCOL_v2_user", JSON.stringify(currentUser))
      localStorage.setItem("TESOCOL_v2_auth", JSON.stringify(isLoggedIn))
      localStorage.setItem("TESOCOL_v2_projects", JSON.stringify(projectsList))
      localStorage.setItem("TESOCOL_v2_requests", JSON.stringify(requestsList))
      localStorage.setItem("TESOCOL_v2_deliveries", JSON.stringify(deliveriesList))
      localStorage.setItem("TESOCOL_v2_returns", JSON.stringify(returnsList))
      localStorage.setItem("TESOCOL_v2_site_reports", JSON.stringify(siteReportsList))
    } catch (e) {
      console.error("Failed saving local storage", e)
    }
  }, [currentUser, isLoggedIn, projectsList, requestsList, deliveriesList, returnsList, siteReportsList])

  const loginAsRole = (role: "engineer" | "technician", email?: string) => {
    setIsLoggedIn(true)
    if (role === "engineer") {
      setCurrentUser({
        ...defaultEngineerUser,
        email: email || defaultEngineerUser.email
      })
    } else {
      setCurrentUser({
        ...defaultTechnicianUser,
        email: email || defaultTechnicianUser.email
      })
    }
  }

  const logout = () => {
    setIsLoggedIn(false)
  }

  const addProject = (data: Omit<Project, "id" | "createdDate" | "engineerInitials">): Project => {
    const newId = `PRJ-${Math.floor(1000 + Math.random() * 9000)}`
    const initials = data.engineer ? data.engineer.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "MC"
    const newProject: Project = {
      ...data,
      id: newId,
      createdDate: new Date().toISOString().split("T")[0],
      engineerInitials: initials,
      materials: []
    }
    setProjectsList(prev => [newProject, ...prev])
    setActivityList(prev => [
      {
        id: String(Date.now()),
        type: "project",
        title: `Nuevo Proyecto ${newId} creado`,
        description: `${newProject.name} (${newProject.client}) - Creado por ${currentUser.name}`,
        user: currentUser.name,
        time: "Hace un momento"
      },
      ...prev
    ])
    return newProject
  }

  const updateProject = (id: string, updated: Partial<Project>) => {
    setProjectsList(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p))
  }

  const deleteProject = (id: string) => {
    setProjectsList(prev => prev.filter(p => p.id !== id))
  }

  const addMaterialRequest = (data: Omit<MaterialRequest, "id" | "reference" | "date" | "itemsCount"> & { itemsList: any[] }): MaterialRequest => {
    const newId = String(Date.now())
    const ref = `SOL-${Math.floor(5800 + Math.random() * 200)}`
    const newReq: MaterialRequest = {
      ...data,
      id: newId,
      reference: ref,
      date: new Date().toISOString().split("T")[0],
      itemsCount: data.itemsList.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0),
      requestedByRole: currentUser.role
    }
    setRequestsList(prev => [newReq, ...prev])
    setActivityList(prev => [
      {
        id: String(Date.now()),
        type: "request",
        title: `Nueva Solicitud ${ref} registrada`,
        description: `${newReq.requestedBy} (${newReq.requestedByRole === 'technician' ? 'Técnico' : 'Ingeniero'}) solicitó materiales para ${newReq.project}`,
        user: currentUser.name,
        time: "Hace un momento"
      },
      ...prev
    ])
    return newReq
  }

  const updateRequestStatus = (id: string, status: MaterialRequest["status"]) => {
    setRequestsList(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  const addDelivery = (data: Omit<Delivery, "id" | "reference" | "items">): Delivery => {
    const delivery: Delivery = { ...data, id: String(Date.now()), reference: `ENT-${Math.floor(1000 + Math.random() * 9000)}`, items: 0 }
    setDeliveriesList(prev => [delivery, ...prev])
    return delivery
  }

  const addReturn = (data: Omit<ReturnRecord, "id" | "reference" | "items">): ReturnRecord => {
    const returnRecord: ReturnRecord = { ...data, id: String(Date.now()), reference: `DEV-${Math.floor(1000 + Math.random() * 9000)}`, items: 0 }
    setReturnsList(prev => [returnRecord, ...prev])
    return returnRecord
  }

  const addSiteReport = (data: Omit<SiteMaterialReport, "id" | "date" | "technician">): SiteMaterialReport => {
    const report = { ...data, id: String(Date.now()), date: new Date().toISOString().slice(0, 10), technician: currentUser.name }
    setSiteReportsList(prev => [report, ...prev])
    return report
  }

  return (
    <StoreContext.Provider
      value={{
        isLoggedIn,
        currentUser,
        setCurrentUser,
        projects: projectsList,
        addProject,
        updateProject,
        deleteProject,
        materialRequests: requestsList,
        addMaterialRequest,
        updateRequestStatus,
        deliveries: deliveriesList,
        addDelivery,
        returns: returnsList,
        addReturn,
        siteReports: siteReportsList,
        addSiteReport,
        activity: activityList,
        loginAsRole,
        logout
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = React.useContext(StoreContext)
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider")
  }
  return context
}
