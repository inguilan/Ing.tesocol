"use client"

import * as React from "react"
import { projects as initialProjects, materialRequests as initialRequests, deliveries as initialDeliveries, returns as initialReturns, activity as initialActivity } from "./data"
import type { Project, MaterialRequest, Delivery, ReturnRecord, ActivityEvent, User, ProjectMaterial, SiteMaterialReport } from "./types"
import { supabase } from "./supabase-browser"

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

export const defaultSuperadminUser: User = {
  id: "usr-admin-1",
  name: "Administrador TESOCOL",
  email: "admin@tesocol.local",
  role: "superadmin",
  initials: "AD",
}

export const defaultTechnicianUser: User = {
  id: "usr-tech-1",
  name: "Carlos Ruiz (Técnico Obra)",
  email: "c.ruiz@TESOCOL.com",
  role: "technician",
  initials: "CR"
}

export const technicianUsers: User[] = [
  defaultTechnicianUser,
  { id: "usr-tech-2", name: "Laura Gómez (Técnica Obra)", email: "l.gomez@TESOCOL.com", role: "technician", initials: "LG" },
  { id: "usr-tech-3", name: "Andrés Torres (Técnico Obra)", email: "a.torres@TESOCOL.com", role: "technician", initials: "AT" },
]

interface StoreContextType {
  isLoggedIn: boolean
  currentUser: User
  technicians: User[]
  users: User[]
  addUser: (user: Omit<User, "id" | "initials"> & { password: string }) => Promise<User | null>
  updateUserPassword: (id: string, password: string) => Promise<boolean>
  setUserActive: (id: string, active: boolean) => Promise<boolean>
  setCurrentUser: (user: User) => void
  projects: Project[]
  addProject: (project: Omit<Project, "id" | "createdDate" | "engineerInitials">) => Project
  updateProject: (id: string, updated: Partial<Project>) => void
  deleteProject: (id: string) => void
  materialRequests: MaterialRequest[]
  addMaterialRequest: (request: Omit<MaterialRequest, "id" | "reference" | "date" | "itemsCount"> & { itemsList: any[] }) => MaterialRequest
  updateRequestStatus: (id: string, status: MaterialRequest["status"]) => void
  deliveries: Delivery[]
  addDelivery: (delivery: Omit<Delivery, "id" | "reference">) => Delivery
  updateDelivery: (id: string, updated: Partial<Omit<Delivery, "id" | "reference">>) => void
  deleteDelivery: (id: string) => void
  updateDeliveryStatus: (id: string, status: Delivery["status"], details?: Pick<Delivery, "receivedBy" | "receivedDate">) => void
  returns: ReturnRecord[]
  addReturn: (returnRecord: Omit<ReturnRecord, "id" | "reference">) => ReturnRecord
  updateReturn: (id: string, updated: Partial<Omit<ReturnRecord, "id" | "reference">>) => void
  deleteReturn: (id: string) => void
  updateReturnStatus: (id: string, status: ReturnRecord["status"]) => void
  siteReports: SiteMaterialReport[]
  addSiteReport: (report: Omit<SiteMaterialReport, "id" | "date" | "technician">) => SiteMaterialReport
  activity: ActivityEvent[]
  login: (email: string, password: string) => Promise<boolean>
  loginAsRole: (role: User["role"], email?: string, password?: string) => boolean
  logout: () => void
}

const StoreContext = React.createContext<StoreContextType | undefined>(undefined)

interface LocalAccount extends User {
  password: string
  active: boolean
}

interface AppState {
  projects: Project[]
  materialRequests: MaterialRequest[]
  deliveries: Delivery[]
  returns: ReturnRecord[]
  siteReports: SiteMaterialReport[]
  activity: ActivityEvent[]
}

type BrowserSupabaseClient = NonNullable<typeof supabase>

async function syncOperationalTables(client: BrowserSupabaseClient, state: AppState) {
  const tableIds = [
    { table: "projects", ids: state.projects.map((item) => item.id) },
    { table: "material_requests", ids: state.materialRequests.map((item) => item.id) },
    { table: "deliveries", ids: state.deliveries.map((item) => item.id) },
    { table: "returns", ids: state.returns.map((item) => item.id) },
    { table: "site_reports", ids: state.siteReports.map((item) => item.id) },
    { table: "activity_events", ids: state.activity.map((item) => item.id) },
  ] as const

  const operations = [
    client.from("projects").upsert(state.projects.map((project) => ({
      legacy_id: project.id,
      name: project.name,
      client: project.client,
      status: project.status,
      location: project.location,
      capacity_kw: project.capacityKw,
      priority: project.priority,
      engineer: project.engineer,
      engineer_initials: project.engineerInitials,
      technician_id: project.technicianId ?? null,
      technician: project.technician ?? null,
      description: project.description ?? null,
      materials: project.materials ?? [],
    })), { onConflict: "legacy_id" }),
    client.from("material_requests").upsert(state.materialRequests.map((request) => ({
      legacy_id: request.id,
      reference: request.reference,
      project_name: request.project,
      project_legacy_id: request.projectId ?? null,
      requested_by_name: request.requestedBy,
      requested_by_role: request.requestedByRole ?? null,
      items_count: request.itemsCount,
      items: request.itemsList ?? [],
      material_name: request.itemsList?.[0]?.materialName ?? request.reference,
      quantity: request.itemsList?.reduce((total, item) => total + Number(item.quantity || 0), 0) || request.itemsCount,
      unit: request.itemsList?.[0]?.unit ?? "unidad",
      status: request.status,
      priority: request.priority,
      request_date: request.date,
      notes: request.notes ?? null,
    })), { onConflict: "legacy_id" }),
    client.from("deliveries").upsert(state.deliveries.map((delivery) => ({
      legacy_id: delivery.id,
      reference: delivery.reference,
      project_name: delivery.project,
      project_legacy_id: delivery.projectId ?? null,
      carrier: delivery.carrier,
      scheduled_date: delivery.scheduledDate,
      items_count: delivery.items,
      status: delivery.status,
      created_by_name: delivery.createdBy ?? null,
      received_by_name: delivery.receivedBy ?? null,
      received_date: delivery.receivedDate ?? null,
      notes: delivery.notes ?? null,
    })), { onConflict: "legacy_id" }),
    client.from("returns").upsert(state.returns.map((record) => ({
      legacy_id: record.id,
      reference: record.reference,
      project_name: record.project,
      project_legacy_id: record.projectId ?? null,
      quantity: record.items,
      items_count: record.items,
      reason: record.reason,
      status: record.status,
      project_date: record.date,
      condition: record.condition ?? null,
      notes: record.notes ?? null,
      created_by_name: record.createdBy ?? null,
    })), { onConflict: "legacy_id" }),
    client.from("site_reports").upsert(state.siteReports.map((report) => ({
      legacy_id: report.id,
      project_id: report.projectId,
      project_name: report.project,
      technician: report.technician,
      report_date: report.date,
      materials_left: report.materialsLeft,
      materials_returned: report.materialsReturned,
      notes: report.notes ?? null,
    })), { onConflict: "legacy_id" }),
    client.from("activity_events").upsert(state.activity.map((event) => ({
      legacy_id: event.id,
      event_type: event.type,
      title: event.title,
      description: event.description,
      user_name: event.user,
      event_time: event.time,
    })), { onConflict: "legacy_id" }),
  ]

  const results = await Promise.all(operations)
  const failed = results
    .map((result, index) => ({ result, table: ["projects", "material_requests", "deliveries", "returns", "site_reports", "activity_events"][index] }))
    .find(({ result }) => result.error)
  if (failed?.result.error) {
    console.error(`Failed syncing Supabase table ${failed.table}`, {
      code: failed.result.error.code,
      message: failed.result.error.message,
      details: failed.result.error.details,
      hint: failed.result.error.hint,
    })
  }
  if (failed) return false

  const cleanupResults = await Promise.all(tableIds.map(({ table, ids }) => {
    const query = client.from(table).delete()
    return ids.length > 0
      ? query.not("legacy_id", "in", `(${ids.join(",")})`)
      : query.not("legacy_id", "is", null)
  }))
  const cleanupFailure = cleanupResults.find((result) => result.error)
  if (cleanupFailure?.error) {
    console.error("Failed cleaning stale Supabase operational rows", {
      code: cleanupFailure.error.code,
      message: cleanupFailure.error.message,
      details: cleanupFailure.error.details,
      hint: cleanupFailure.error.hint,
    })
  }
  return !cleanupFailure
}

const initialAccounts: LocalAccount[] = [
  { ...defaultSuperadminUser, password: "TESOCOL-admin-2026", active: true },
  { ...defaultEngineerUser, password: "TESOCOL-ingeniero-2026", active: true },
  ...technicianUsers.map((user) => ({ ...user, password: `TESOCOL-${user.id}`, active: true })),
]

function readStoredArray<T>(key: string, fallback: T[]): T[] {
  try {
    const value = localStorage.getItem(key)
    if (!value) return fallback
    const parsed: unknown = JSON.parse(value)
    return Array.isArray(parsed) ? parsed as T[] : fallback
  } catch {
    return fallback
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false)
  const [authReady, setAuthReady] = React.useState<boolean>(!supabase)
  const [currentUser, setCurrentUser] = React.useState<User>(defaultEngineerUser)
  const [accountsList, setAccountsList] = React.useState<LocalAccount[]>(initialAccounts)
  
  // Hydrate projects with sample materials
  const [projectsList, setProjectsList] = React.useState<Project[]>(() => {
    return initialProjects.map((project) => ({
      ...project,
      materials: project.materials ?? (project.id === "PRJ-1042" ? sampleMaterials : []),
    }))
  })

  const [requestsList, setRequestsList] = React.useState<MaterialRequest[]>(() => {
    return initialRequests.map(r => ({
      ...r,
      itemsCount: r.itemsCount,
      itemsList: [
        { id: "i1", materialName: "Panel Solar 550W", quantity: 20, unit: "piezas", notes: "Lote A" },
        { id: "i2", materialName: "Inversor Trifásico 50kW", quantity: 2, unit: "unidades", notes: "Urgente" },
        { id: "i3", materialName: "Cable Solar 6mm²", quantity: 150, unit: "metros", notes: "Color rojo" }
      ]
    }))
  })

  const [deliveriesList, setDeliveriesList] = React.useState<Delivery[]>(initialDeliveries)
  const [returnsList, setReturnsList] = React.useState<ReturnRecord[]>(initialReturns)
  const [activityList, setActivityList] = React.useState<ActivityEvent[]>(initialActivity)
  const [siteReportsList, setSiteReportsList] = React.useState<SiteMaterialReport[]>([])
  const appStateHydrated = React.useRef(!supabase)

  React.useEffect(() => {
    if (!supabase) return
    const client = supabase
    let mounted = true

    const loadUser = async (userId: string) => {
      const { data, error } = await client.from("profiles").select("id, name, email, role, initials, avatar, active").eq("id", userId).single()
      if (!mounted) return
      if (error) {
        console.error("Failed loading authenticated profile", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        })
        setIsLoggedIn(false)
        setAuthReady(true)
        return
      }
      if (data) {
        setCurrentUser(data as User)
        setIsLoggedIn(data.active !== false)
        const { data: profiles, error: profilesError } = await client
          .from("profiles")
          .select("id, name, email, role, initials, avatar, active")
          .eq("active", true)
          .order("name")
        if (profilesError) {
          console.error("Failed loading technician profiles", {
            code: profilesError.code,
            message: profilesError.message,
            details: profilesError.details,
            hint: profilesError.hint,
          })
        } else if (profiles) {
          setAccountsList(profiles.map((user) => ({ ...user, password: "", active: user.active !== false })))
        }
        const { data: { session } } = await client.auth.getSession()
        if (session && data.role === "superadmin") {
          const response = await fetch("/api/admin/users", { headers: { Authorization: `Bearer ${session.access_token}` } })
          if (response.ok) {
            const result = await response.json() as { users: User[] }
            setAccountsList(result.users.map((user) => ({ ...user, password: "", active: user.active !== false })))
          }
        }
      } else {
        setIsLoggedIn(false)
      }
      setAuthReady(true)
    }

    void client.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) void loadUser(session.user.id)
      else if (mounted) setAuthReady(true)
    })

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) void loadUser(session.user.id)
      else if (mounted) {
        setIsLoggedIn(false)
        setAuthReady(true)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Load / Save localStorage state
  React.useEffect(() => {
    try {
      if (supabase) return
      const savedUser = localStorage.getItem("TESOCOL_v2_user")
      if (savedUser) {
        const parsedUser: unknown = JSON.parse(savedUser)
        if (parsedUser && typeof parsedUser === "object" && "role" in parsedUser && "name" in parsedUser) {
          setCurrentUser(parsedUser as User)
        }
        setIsLoggedIn(true)
      }
      const savedAuth = localStorage.getItem("TESOCOL_v2_auth")
      if (savedAuth) {
        const parsedAuth: unknown = JSON.parse(savedAuth)
        if (typeof parsedAuth === "boolean") setIsLoggedIn(parsedAuth)
      }
      const storedProjects = readStoredArray<Project>("TESOCOL_v2_projects", projectsList)
      setProjectsList(storedProjects.map((project, index) => {
        const technician = project.technicianId
          ? technicianUsers.find((user) => user.id === project.technicianId)
          : technicianUsers[index % technicianUsers.length]
        return {
          ...project,
          technicianId: project.technicianId ?? technician?.id,
          technician: project.technician ?? technician?.name,
        }
      }))
      const savedRequests = readStoredArray<Record<string, unknown>>("TESOCOL_v2_requests", requestsList as unknown as Record<string, unknown>[])
      setRequestsList(savedRequests.map((request) => ({
        ...request,
        itemsCount: Number(request.itemsCount ?? request.items ?? 0),
      })) as MaterialRequest[])
      setDeliveriesList(readStoredArray("TESOCOL_v2_deliveries", deliveriesList))
      setReturnsList(readStoredArray("TESOCOL_v2_returns", returnsList))
      setSiteReportsList(readStoredArray("TESOCOL_v2_site_reports", siteReportsList))
      setActivityList(readStoredArray("TESOCOL_v2_activity", activityList))
      const storedAccounts = readStoredArray<LocalAccount>("TESOCOL_v2_accounts", [])
      const mergedAccounts = initialAccounts.map((defaultAccount) => {
        const storedAccount = storedAccounts.find((account) => account.id === defaultAccount.id || account.email.toLowerCase() === defaultAccount.email.toLowerCase())
        return storedAccount ? {
          ...defaultAccount,
          ...storedAccount,
          active: defaultAccount.id === defaultSuperadminUser.id ? true : storedAccount.active !== false,
        } : defaultAccount
      })
      const customAccounts = storedAccounts.filter((account) => !initialAccounts.some((defaultAccount) => defaultAccount.id === account.id || defaultAccount.email.toLowerCase() === account.email.toLowerCase()))
      setAccountsList([...mergedAccounts, ...customAccounts])
    } catch (e) {
      console.error("Failed loading local storage", e)
    }
  }, []) 

  React.useEffect(() => {
    if (!supabase || !isLoggedIn) return
    const client = supabase
    let mounted = true

    const loadAppState = async () => {
      const { data, error } = await client.from("app_state").select("state").eq("id", "default").maybeSingle()
      if (!mounted) return
      if (error) {
        console.error("Failed loading Supabase app state", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        })
        appStateHydrated.current = true
        return
      }
      if (data?.state) {
        const state = data.state as Partial<AppState>
        if (state.projects) setProjectsList(state.projects)
        if (state.materialRequests) setRequestsList(state.materialRequests)
        if (state.deliveries) setDeliveriesList(state.deliveries)
        if (state.returns) setReturnsList(state.returns)
        if (state.siteReports) setSiteReportsList(state.siteReports)
        if (state.activity) setActivityList(state.activity)
        const { data: persistedRequests, error: persistedRequestsError } = await client.from("material_requests").select("legacy_id, reference, project_legacy_id, project_name, requested_by_name, requested_by_role, items_count, items, status, priority, request_date, notes").order("request_date", { ascending: false })
        if (persistedRequestsError) {
          console.error("Failed loading Supabase material requests", persistedRequestsError)
        } else if (persistedRequests) {
          setRequestsList(persistedRequests.map((request) => ({
            id: request.legacy_id,
            reference: request.reference ?? request.legacy_id,
            projectId: request.project_legacy_id ?? undefined,
            project: request.project_name ?? "",
            requestedBy: request.requested_by_name ?? "",
            requestedByRole: request.requested_by_role ?? undefined,
            itemsCount: request.items_count ?? 0,
            itemsList: request.items ?? [],
            status: request.status,
            priority: request.priority,
            date: request.request_date,
            notes: request.notes ?? undefined,
          })))
        }
        const { data: reports, error: reportsError } = await client.from("site_reports").select("legacy_id, project_id, project_name, technician, report_date, materials_left, materials_returned, notes").order("report_date", { ascending: false })
        if (reportsError) {
          console.error("Failed loading Supabase site reports", reportsError)
        } else if (reports) {
          setSiteReportsList(reports.map((report) => ({
            id: report.legacy_id,
            projectId: report.project_id,
            project: report.project_name,
            technician: report.technician,
            date: report.report_date,
            materialsLeft: report.materials_left ?? "",
            materialsReturned: report.materials_returned ?? "",
            notes: report.notes ?? undefined,
          })))
        }
      } else {
        const initialState: AppState = {
          projects: projectsList,
          materialRequests: requestsList,
          deliveries: deliveriesList,
          returns: returnsList,
          siteReports: siteReportsList,
          activity: activityList,
        }
        const { error: insertError } = await client.from("app_state").insert({ id: "default", state: initialState })
        if (insertError) console.error("Failed initializing Supabase app state", insertError)
        await syncOperationalTables(client, initialState)
      }
      appStateHydrated.current = true
    }

    void loadAppState()
    return () => {
      mounted = false
    }
  }, [isLoggedIn])

  React.useEffect(() => {
    try {
      if (supabase) {
        if (!isLoggedIn || !appStateHydrated.current || (currentUser.role !== "engineer" && currentUser.role !== "superadmin")) return
        const state: AppState = {
          projects: projectsList,
          materialRequests: requestsList,
          deliveries: deliveriesList,
          returns: returnsList,
          siteReports: siteReportsList,
          activity: activityList,
        }
        void supabase.from("app_state").upsert({ id: "default", state, updated_at: new Date().toISOString() }).then(({ error }) => {
          if (error) console.error("Failed saving Supabase app state", error)
        })
        void syncOperationalTables(supabase, state)
        return
      }
      localStorage.setItem("TESOCOL_v2_user", JSON.stringify(currentUser))
      localStorage.setItem("TESOCOL_v2_auth", JSON.stringify(isLoggedIn))
      localStorage.setItem("TESOCOL_v2_projects", JSON.stringify(projectsList))
      localStorage.setItem("TESOCOL_v2_requests", JSON.stringify(requestsList))
      localStorage.setItem("TESOCOL_v2_deliveries", JSON.stringify(deliveriesList))
      localStorage.setItem("TESOCOL_v2_returns", JSON.stringify(returnsList))
      localStorage.setItem("TESOCOL_v2_site_reports", JSON.stringify(siteReportsList))
      localStorage.setItem("TESOCOL_v2_activity", JSON.stringify(activityList))
      localStorage.setItem("TESOCOL_v2_accounts", JSON.stringify(accountsList))
    } catch (e) {
      console.error("Failed saving local storage", e)
    }
  }, [currentUser, isLoggedIn, projectsList, requestsList, deliveriesList, returnsList, siteReportsList, activityList, accountsList])

  const loginAsRole = (role: User["role"], email?: string, password?: string) => {
    const account = accountsList.find((item) => item.role === role && item.email.toLowerCase() === (email ?? "").toLowerCase() && item.active)
    const isQuickLogin = !password && (role === "engineer" || role === "technician")
    if (!account && !isQuickLogin) return false
    setIsLoggedIn(true)
    const selectedUser = account ?? (role === "engineer" ? defaultEngineerUser : defaultTechnicianUser)
    setCurrentUser(selectedUser)
    return true
  }

  const login = async (email: string, password: string) => {
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) {
        console.error("Supabase login failed", `code=${error.code ?? "unknown"}`, `message=${error.message ?? "unknown"}`, `status=${error.status ?? "unknown"}`)
      }
      return !error
    }
    const account = accountsList.find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password.trim() && item.active)
    if (!account) return false
    setCurrentUser(account)
    setIsLoggedIn(true)
    return true
  }

  const addUser = async (data: Omit<User, "id" | "initials"> & { password: string }): Promise<User | null> => {
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return null
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: "create", ...data }),
      })
      if (!response.ok) return null
      const result = await response.json() as { user: User }
      setAccountsList((prev) => [...prev.filter((user) => user.id !== result.user.id), { ...result.user, password: "", active: true }])
      return result.user
    }
    if (accountsList.some((user) => user.email.toLowerCase() === data.email.toLowerCase())) return null
    const initials = data.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
    const user: LocalAccount = { ...data, id: `usr-${Date.now()}`, initials, active: true }
    setAccountsList((prev) => [...prev, user])
    return user
  }

  const setUserActive = async (id: string, active: boolean): Promise<boolean> => {
    if (id === defaultSuperadminUser.id) return false
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return false
      const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ action: "set-active", id, active }) })
      if (!response.ok) return false
    }
    setAccountsList((prev) => prev.map((user) => user.id === id ? { ...user, active } : user))
    return true
  }

  const updateUserPassword = async (id: string, password: string): Promise<boolean> => {
    if (password.trim().length < 8) return false
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return false
      const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ action: "update-password", id, password: password.trim() }) })
      return response.ok
    }
    const exists = accountsList.some((user) => user.id === id)
    if (!exists) return false
    setAccountsList((prev) => prev.map((user) => {
      if (user.id !== id) return user
      return { ...user, password: password.trim() }
    }))
    return true
  }

  const logout = () => {
    if (supabase) {
      void supabase.auth.signOut()
      return
    }
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
    const project = projectsList.find((item) => item.id === id)
    setProjectsList(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p))
    if (project && updated.status && updated.status !== project.status) {
      setActivityList(prev => [{
        id: String(Date.now()),
        type: "project",
        title: `${project.id} cambió a ${updated.status}`,
        description: `Estado actualizado para ${project.name}`,
        user: currentUser.name,
        time: "Hace un momento",
      }, ...prev])
    }
  }

  const deleteProject = (id: string) => {
    setProjectsList(prev => prev.filter(p => p.id !== id))
    setRequestsList(prev => prev.filter((request) => request.projectId !== id))
    setDeliveriesList(prev => prev.filter((delivery) => delivery.projectId !== id))
    setReturnsList(prev => prev.filter((record) => record.projectId !== id))
    setSiteReportsList(prev => prev.filter((report) => report.projectId !== id))
    if (supabase) void supabase.from("projects").delete().eq("legacy_id", id)
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
    if (supabase && currentUser.role === "technician") {
      void supabase.from("material_requests").insert({
        legacy_id: newReq.id,
        reference: newReq.reference,
        project_legacy_id: newReq.projectId ?? null,
        project_name: newReq.project,
        requested_by: currentUser.id,
        requested_by_name: newReq.requestedBy,
        requested_by_role: newReq.requestedByRole,
        items_count: newReq.itemsCount,
        items: newReq.itemsList ?? [],
        material_name: newReq.itemsList?.[0]?.materialName ?? newReq.reference,
        quantity: newReq.itemsList?.reduce((total, item) => total + Number(item.quantity || 0), 0) || newReq.itemsCount,
        unit: newReq.itemsList?.[0]?.unit ?? "unidad",
        status: newReq.status,
        priority: newReq.priority,
        request_date: newReq.date,
        notes: newReq.notes ?? null,
      }).then(({ error }) => {
        if (error) console.error("Failed saving Supabase material request", error)
      })
    }
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
    const request = requestsList.find((item) => item.id === id)
    setRequestsList(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    if (request) {
      setActivityList(prev => [{
        id: String(Date.now()),
        type: "approval",
        title: `${request.reference} cambió a ${status}`,
        description: `Actualizado para ${request.project}`,
        user: currentUser.name,
        time: "Hace un momento",
      }, ...prev])
    }
  }

  const addDelivery = (data: Omit<Delivery, "id" | "reference">): Delivery => {
    const delivery: Delivery = { ...data, id: String(Date.now()), reference: `ENT-${Math.floor(1000 + Math.random() * 9000)}`, createdBy: currentUser.name }
    setDeliveriesList(prev => [delivery, ...prev])
    setActivityList(prev => [{
      id: String(Date.now()),
      type: "delivery",
      title: `Entrega ${delivery.reference} programada`,
      description: `${delivery.items} artículos para ${delivery.project}`,
      user: currentUser.name,
      time: "Hace un momento",
    }, ...prev])
    return delivery
  }

  const updateDelivery = (id: string, updated: Partial<Omit<Delivery, "id" | "reference">>) => {
    const delivery = deliveriesList.find((item) => item.id === id)
    setDeliveriesList(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item))
    if (delivery) {
      setActivityList(prev => [{
        id: String(Date.now()),
        type: "delivery",
        title: `${delivery.reference} actualizada`,
        description: `Entrega para ${updated.project ?? delivery.project}`,
        user: currentUser.name,
        time: "Hace un momento",
      }, ...prev])
    }
  }

  const deleteDelivery = (id: string) => {
    setDeliveriesList(prev => prev.filter(item => item.id !== id))
    if (supabase) void supabase.from("deliveries").delete().eq("legacy_id", id)
  }

  const updateDeliveryStatus = (id: string, status: Delivery["status"], details?: Pick<Delivery, "receivedBy" | "receivedDate">) => {
    const delivery = deliveriesList.find((item) => item.id === id)
    setDeliveriesList(prev => prev.map(item => item.id === id ? { ...item, status, ...details } : item))
    if (delivery) {
      setActivityList(prev => [{
        id: String(Date.now()),
        type: "delivery",
        title: `${delivery.reference} cambió a ${status}`,
        description: `Entrega para ${delivery.project}`,
        user: currentUser.name,
        time: "Hace un momento",
      }, ...prev])
    }
  }

  const addReturn = (data: Omit<ReturnRecord, "id" | "reference">): ReturnRecord => {
    const returnRecord: ReturnRecord = { ...data, id: String(Date.now()), reference: `DEV-${Math.floor(1000 + Math.random() * 9000)}`, createdBy: currentUser.name }
    setReturnsList(prev => [returnRecord, ...prev])
    setActivityList(prev => [{
      id: String(Date.now()),
      type: "return",
      title: `Devolución ${returnRecord.reference} registrada`,
      description: `${returnRecord.items} artículos de ${returnRecord.project}`,
      user: currentUser.name,
      time: "Hace un momento",
    }, ...prev])
    return returnRecord
  }

  const updateReturn = (id: string, updated: Partial<Omit<ReturnRecord, "id" | "reference">>) => {
    const returnRecord = returnsList.find((item) => item.id === id)
    setReturnsList(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item))
    if (returnRecord) {
      setActivityList(prev => [{
        id: String(Date.now()),
        type: "return",
        title: `${returnRecord.reference} actualizada`,
        description: `Devolución de ${updated.project ?? returnRecord.project}`,
        user: currentUser.name,
        time: "Hace un momento",
      }, ...prev])
    }
  }

  const deleteReturn = (id: string) => {
    setReturnsList(prev => prev.filter(item => item.id !== id))
    if (supabase) void supabase.from("returns").delete().eq("legacy_id", id)
  }

  const updateReturnStatus = (id: string, status: ReturnRecord["status"]) => {
    const returnRecord = returnsList.find((item) => item.id === id)
    setReturnsList(prev => prev.map(item => item.id === id ? { ...item, status } : item))
    if (returnRecord) {
      setActivityList(prev => [{
        id: String(Date.now()),
        type: "return",
        title: `${returnRecord.reference} cambió a ${status}`,
        description: `Devolución de ${returnRecord.project}`,
        user: currentUser.name,
        time: "Hace un momento",
      }, ...prev])
    }
  }

  const addSiteReport = (data: Omit<SiteMaterialReport, "id" | "date" | "technician">): SiteMaterialReport => {
    const report = { ...data, id: String(Date.now()), date: new Date().toISOString().slice(0, 10), technician: currentUser.name }
    setSiteReportsList(prev => [report, ...prev])
    if (supabase) {
      void supabase.from("site_reports").insert({
        legacy_id: report.id,
        project_id: report.projectId,
        project_name: report.project,
        technician: report.technician,
        report_date: report.date,
        materials_left: report.materialsLeft,
        materials_returned: report.materialsReturned,
        notes: report.notes ?? null,
      }).then(({ error }) => {
        if (error) console.error("Failed saving Supabase site report", error)
      })
    }
    return report
  }

  if (!authReady) return null

  return (
    <StoreContext.Provider
      value={{
        isLoggedIn,
        currentUser,
        technicians: accountsList.filter((user) => user.role === "technician" && user.active),
        users: accountsList.map(({ password: _password, ...user }) => user),
        addUser,
        updateUserPassword,
        setUserActive,
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
        updateDelivery,
        deleteDelivery,
        updateDeliveryStatus,
        returns: returnsList,
        addReturn,
        updateReturn,
        deleteReturn,
        updateReturnStatus,
        siteReports: siteReportsList,
        addSiteReport,
        activity: activityList,
        login,
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
