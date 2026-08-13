"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"

interface FormState {
  name: string
  client: string
  location: string
  capacityKw: string
  engineer: string
  priority: string
  status: string
  startDate: string
  notes: string
}

const initialState: FormState = {
  name: "",
  client: "",
  location: "",
  capacityKw: "",
  engineer: "",
  priority: "medium",
  status: "planning",
  startDate: "",
  notes: "",
}

const engineers = [
  "Maya Chen",
  "Javier Okoro",
  "Sofía Reyes",
  "Daniel Parra",
  "Priya Nair",
]

export function CreateProjectForm() {
  const router = useRouter()
  const [form, setForm] = React.useState<FormState>(initialState)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [pending, setPending] = React.useState(false)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key as string]
      return next
    })
  }

  function validate() {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = "El nombre del proyecto es obligatorio."
    if (!form.client.trim()) next.client = "Indica el cliente."
    if (!form.location.trim()) next.location = "Indica la ubicación de la obra."
    if (!form.capacityKw.trim()) {
      next.capacityKw = "Indica la capacidad en kW."
    } else if (Number(form.capacityKw) <= 0) {
      next.capacityKw = "La capacidad debe ser mayor a cero."
    }
    if (!form.engineer) next.engineer = "Asigna un ingeniero responsable."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) {
      toast.error("Revisa los campos marcados en el formulario.")
      return
    }
    setPending(true)
    await new Promise((resolve) => setTimeout(resolve, 900))
    setPending(false)
    toast.success("Proyecto creado", {
      description: `${form.name} se registró para ${form.client}.`,
    })
    router.push("/projects")
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Datos del proyecto</CardTitle>
          <CardDescription>
            Registra la información base para habilitar solicitudes de material.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-8">
          <FieldSet>
            <FieldLegend>Información general</FieldLegend>
            <FieldGroup>
              <Field data-invalid={errors.name ? true : undefined}>
                <FieldLabel htmlFor="name">Nombre del proyecto</FieldLabel>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Parque Solar Ribera"
                  aria-invalid={errors.name ? true : undefined}
                />
                <FieldDescription>
                  {errors.name ?? "Usa un nombre descriptivo de la instalación."}
                </FieldDescription>
              </Field>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field data-invalid={errors.client ? true : undefined}>
                  <FieldLabel htmlFor="client">Cliente</FieldLabel>
                  <Input
                    id="client"
                    value={form.client}
                    onChange={(e) => update("client", e.target.value)}
                    placeholder="Helios Energía S.A."
                    aria-invalid={errors.client ? true : undefined}
                  />
                  {errors.client ? (
                    <FieldDescription>{errors.client}</FieldDescription>
                  ) : null}
                </Field>

                <Field data-invalid={errors.location ? true : undefined}>
                  <FieldLabel htmlFor="location">Ubicación</FieldLabel>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => update("location", e.target.value)}
                    placeholder="Monterrey, NL"
                    aria-invalid={errors.location ? true : undefined}
                  />
                  {errors.location ? (
                    <FieldDescription>{errors.location}</FieldDescription>
                  ) : null}
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Especificaciones y asignación</FieldLegend>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field data-invalid={errors.capacityKw ? true : undefined}>
                  <FieldLabel htmlFor="capacity">Capacidad (kW)</FieldLabel>
                  <Input
                    id="capacity"
                    type="number"
                    min={1}
                    value={form.capacityKw}
                    onChange={(e) => update("capacityKw", e.target.value)}
                    placeholder="850"
                    aria-invalid={errors.capacityKw ? true : undefined}
                  />
                  {errors.capacityKw ? (
                    <FieldDescription>{errors.capacityKw}</FieldDescription>
                  ) : null}
                </Field>

                <Field>
                  <FieldLabel htmlFor="startDate">Fecha de inicio</FieldLabel>
                  <Input
                    id="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => update("startDate", e.target.value)}
                  />
                </Field>

                <Field data-invalid={errors.engineer ? true : undefined}>
                  <FieldLabel htmlFor="engineer">
                    Ingeniero responsable
                  </FieldLabel>
                  <Select
                    value={form.engineer}
                    onValueChange={(value) =>
                      update("engineer", (value as string) ?? "")
                    }
                  >
                    <SelectTrigger
                      id="engineer"
                      aria-invalid={errors.engineer ? true : undefined}
                    >
                      <SelectValue placeholder="Selecciona un ingeniero" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {engineers.map((eng) => (
                          <SelectItem key={eng} value={eng}>
                            {eng}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.engineer ? (
                    <FieldDescription>{errors.engineer}</FieldDescription>
                  ) : null}
                </Field>

                <Field>
                  <FieldLabel htmlFor="priority">Prioridad</FieldLabel>
                  <Select
                    value={form.priority}
                    onValueChange={(value) =>
                      update("priority", (value as string) ?? "medium")
                    }
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="status">Estado inicial</FieldLabel>
                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      update("status", (value as string) ?? "planning")
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="planning">Planeación</SelectItem>
                        <SelectItem value="in_progress">En curso</SelectItem>
                        <SelectItem value="on_hold">En pausa</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="notes">Notas</FieldLabel>
                <Textarea
                  id="notes"
                  rows={4}
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Accesos al sitio, restricciones de horario, requisitos especiales de material..."
                />
                <FieldDescription>
                  Información útil para el equipo de almacén y logística.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldSet>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t">
          <Button
            variant="outline"
            type="button"
            nativeButton={false}
            render={<Link href="/projects" />}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Save data-icon="inline-start" />
            )}
            {pending ? "Guardando..." : "Crear proyecto"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
