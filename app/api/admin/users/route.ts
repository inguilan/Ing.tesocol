import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { UserRole } from "@/lib/types"

export const runtime = "nodejs"

type UserAction = "create" | "update-password" | "set-active"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) return null
  return createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function getRequester(request: NextRequest, adminClient: ReturnType<typeof getAdminClient>) {
  if (!adminClient) return null
  const authorization = request.headers.get("authorization")
  if (!authorization?.startsWith("Bearer ")) return null
  const token = authorization.slice("Bearer ".length)
  const { data: { user } } = await adminClient.auth.getUser(token)
  if (!user) return null
  const { data: profile } = await adminClient.from("profiles").select("role, active").eq("id", user.id).single()
  return profile?.role === "superadmin" && profile.active !== false ? user : null
}

export async function GET(request: NextRequest) {
  const adminClient = getAdminClient()
  const requester = await getRequester(request, adminClient)
  if (!requester || !adminClient) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data, error } = await adminClient.from("profiles").select("id, name, email, role, initials, avatar, active").order("name")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ users: data })
}

export async function POST(request: NextRequest) {
  const adminClient = getAdminClient()
  const requester = await getRequester(request, adminClient)
  if (!requester || !adminClient) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json() as { action?: UserAction; id?: string; name?: string; email?: string; password?: string; role?: Exclude<UserRole, "superadmin">; active?: boolean }
  if (body.action === "create") {
    if (!body.name?.trim() || !body.email?.trim() || !body.password || body.password.length < 8 || !body.role) {
      return NextResponse.json({ error: "Nombre, email, rol y una contraseña de 8 caracteres son obligatorios." }, { status: 400 })
    }
    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email: body.email.trim(),
      password: body.password,
      email_confirm: true,
      user_metadata: { name: body.name.trim() },
    })
    if (createError || !created.user) return NextResponse.json({ error: createError?.message ?? "No se pudo crear el usuario." }, { status: 400 })

    const initials = body.name.trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()
    const { data: profile, error: profileError } = await adminClient.from("profiles").upsert({
      id: created.user.id,
      name: body.name.trim(),
      email: body.email.trim(),
      role: body.role,
      initials,
      active: true,
    }).select("id, name, email, role, initials, avatar, active").single()
    if (profileError) {
      await adminClient.auth.admin.deleteUser(created.user.id)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }
    return NextResponse.json({ user: profile })
  }

  if (!body.id) return NextResponse.json({ error: "Falta el usuario." }, { status: 400 })
  if (body.action === "update-password") {
    if (!body.password || body.password.length < 8) return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 })
    const { error } = await adminClient.auth.admin.updateUserById(body.id, { password: body.password })
    return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ ok: true })
  }

  if (body.action === "set-active") {
    if (body.id === requester.id) return NextResponse.json({ error: "No puedes desactivar tu propia cuenta." }, { status: 400 })
    const { error } = await adminClient.from("profiles").update({ active: body.active === true, updated_at: new Date().toISOString() }).eq("id", body.id)
    return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: "Acción no válida." }, { status: 400 })
}
