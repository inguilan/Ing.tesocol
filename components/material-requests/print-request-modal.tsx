"use client"

import * as React from "react"
import { Building2, Calendar, FileCheck, Printer, ShieldCheck, Sun, UserCheck, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { MaterialRequest } from "@/lib/types"
import { downloadRequestPdf } from "@/lib/pdf-download"

interface PrintRequestModalProps {
  request: MaterialRequest | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PrintRequestModal({
  request,
  open,
  onOpenChange,
}: PrintRequestModalProps) {
  if (!request) return null

  const handlePrint = () => downloadRequestPdf(request)

  const items = request.itemsList || [
    { id: "1", materialName: "Panel Solar Monocristalino 550W", quantity: 20, unit: "piezas", notes: "Lote Principal" },
    { id: "2", materialName: "Inversor Central Trifásico 50kW", quantity: 2, unit: "unidades", notes: "Serie A" },
    { id: "3", materialName: "Cable Solar Fotovoltaico 6mm² Rojo/Negro", quantity: 150, unit: "metros", notes: "Bobina 1" },
    { id: "4", materialName: "Estructura Aluminio Rieles Anodizado", quantity: 15, unit: "kits", notes: "Montaje Techo" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-border/80 print:p-0 print:border-none print:shadow-none">
        {/* Screen Header Actions */}
        <div className="p-4 bg-muted/40 border-b flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="size-5 text-primary" />
            <span className="font-semibold text-sm">Vista Previa para Impresión / PDF Bodega</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handlePrint} className="gap-2 font-semibold">
              <Printer className="size-4" />
              Descargar PDF
            </Button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 md:p-8 bg-background print:p-8 print:w-full space-y-6" id="printable-voucher">
          {/* Header Membrete */}
          <div className="flex items-start justify-between border-b pb-6">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Sun className="size-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">SolarFlow</h1>
                <p className="text-xs text-muted-foreground">Logística & Control de Materiales Solares</p>
                <p className="text-[11px] text-muted-foreground">Documento Oficial de Requisición de Bodega</p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block bg-primary/10 text-primary border border-primary/20 font-mono font-extrabold text-lg px-3 py-1 rounded">
                VALE DE SALIDA: {request.reference}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Fecha Emisión: {request.date}</p>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 capitalize">
                Estado: {request.status.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Project & Request Meta Details Grid */}
          <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border text-sm">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-semibold block mb-0.5">Proyecto Destino:</span>
              <p className="font-bold text-foreground flex items-center gap-1.5 text-base">
                <Building2 className="size-4 text-primary" /> {request.project}
              </p>
              <p className="text-xs text-muted-foreground">ID Proyecto: {request.projectId || "PRJ-REGIONAL"}</p>
            </div>

            <div>
              <span className="text-xs text-muted-foreground uppercase font-semibold block mb-0.5">Solicitado Por:</span>
              <p className="font-bold text-foreground flex items-center gap-1.5 text-base">
                <UserCheck className="size-4 text-primary" /> {request.requestedBy}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                Rol: {request.requestedByRole === "technician" ? "Técnico de Obra" : "Ingeniero Encargado"}
              </p>
            </div>
          </div>

          {/* Items Requisition Table */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Listado de Materiales Solicitados</h3>
            <table className="w-full border-collapse border border-border text-sm">
              <thead>
                <tr className="bg-muted text-muted-foreground text-left text-xs uppercase">
                  <th className="border p-2.5 w-12 text-center">#</th>
                  <th className="border p-2.5">Descripción del Material</th>
                  <th className="border p-2.5 w-28 text-center">Cantidad</th>
                  <th className="border p-2.5 w-24 text-center">Unidad</th>
                  <th className="border p-2.5">Observaciones / Lote</th>
                  <th className="border p-2.5 w-16 text-center print:table-cell">Check</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="border p-2.5 text-center font-mono text-xs">{index + 1}</td>
                    <td className="border p-2.5 font-medium">{item.materialName}</td>
                    <td className="border p-2.5 text-center font-bold text-base">{item.quantity}</td>
                    <td className="border p-2.5 text-center text-xs text-muted-foreground">{item.unit}</td>
                    <td className="border p-2.5 text-xs text-muted-foreground">{item.notes || "N/A"}</td>
                    <td className="border p-2.5 text-center">
                      <div className="size-4 border rounded mx-auto border-muted-foreground/60" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes / Special Instructions */}
          {request.notes && (
            <div className="bg-muted/20 p-3 rounded border text-xs">
              <span className="font-semibold text-foreground block mb-0.5">Notas Especiales:</span>
              <p className="text-muted-foreground">{request.notes}</p>
            </div>
          )}

          {/* Signatures Section for Warehouse Approval */}
          <div className="mt-10 grid grid-cols-1 gap-8 border-t pt-8 text-center text-xs sm:grid-cols-3 print:grid-cols-3 print:gap-4">
            <div className="min-w-0 space-y-3">
              <div className="border-b border-foreground/40 w-3/4 mx-auto" />
              <div>
                <p className="font-bold text-foreground">{request.requestedBy}</p>
                <p className="text-muted-foreground">Firma Solicitante (Obra)</p>
              </div>
            </div>

            <div className="min-w-0 space-y-3">
              <div className="border-b border-foreground/40 w-3/4 mx-auto" />
              <div>
                <p className="font-bold text-foreground">Ing. Maya Chen</p>
                <p className="text-muted-foreground">Firma Autorizó (Ingeniería)</p>
              </div>
            </div>

            <div className="min-w-0 space-y-3">
              <div className="border-b border-foreground/40 w-3/4 mx-auto" />
              <div>
                <p className="font-bold text-foreground">Responsable de Almacén</p>
                <p className="text-muted-foreground">Firma Entregó (Bodega)</p>
              </div>
            </div>
          </div>

          <div className="text-center text-[10px] text-muted-foreground pt-4">
            Documento impreso automáticamente desde SolarFlow Enterprise System • Trazabilidad de Materiales Solares
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
