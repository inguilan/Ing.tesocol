import type { MaterialRequest } from "@/lib/types"

const safe = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[()\\]/g, " ").replace(/[^\x20-\x7E]/g, " ").slice(0, 72)
const text = (value: string, x: number, y: number, size = 10, color = "0.12 0.12 0.12") => `${color} rg\nBT /F1 ${size} Tf ${x} ${y} Td (${safe(value)}) Tj ET\n`
const rect = (x: number, y: number, width: number, height: number, color: string) => `${color} rg\n${x} ${y} ${width} ${height} re f\n`
const line = (x1: number, y1: number, x2: number, y2: number, color = "0.82 0.82 0.82") => `${color} RG\n0.5 w\n${x1} ${y1} m ${x2} ${y2} l S\n`

export function downloadRequestPdf(request: MaterialRequest) {
  const items = request.itemsList || []
  let body = ""
  body += rect(0, 690, 612, 102, "0.06 0.06 0.06")
  body += rect(0, 680, 612, 10, "1 0.31 0")
  body += text("SOLARFLOW", 48, 750, 22, "1 0.31 0")
  body += text("Tecnologia Solar de Colombia", 48, 726, 11, "1 1 1")
  body += text("VALE DE SOLICITUD DE MATERIALES", 48, 640, 19)
  body += text(`Proyecto: ${request.project}`, 48, 615, 11, "0.35 0.35 0.35")
  body += text(`Solicitud: ${request.reference}`, 48, 596, 11, "0.35 0.35 0.35")
  body += text(`Fecha: ${request.date}`, 420, 615, 10, "0.35 0.35 0.35")
  body += text(`Solicitante: ${request.requestedBy}`, 420, 596, 10, "0.35 0.35 0.35")
  body += rect(48, 550, 516, 25, "1 0.31 0")
  body += text("MATERIAL", 56, 559, 9, "1 1 1")
  body += text("CANTIDAD", 344, 559, 9, "1 1 1")
  body += text("UNIDAD", 414, 559, 9, "1 1 1")
  body += text("OBSERVACIONES", 480, 559, 9, "1 1 1")
  let y = 525
  items.slice(0, 12).forEach((item, index) => {
    if (index % 2 === 0) body += rect(48, y - 8, 516, 25, "0.96 0.96 0.96")
    body += text(item.materialName, 56, y, 9)
    body += text(String(item.quantity), 344, y, 9)
    body += text(item.unit, 414, y, 9)
    body += text(item.notes || "-", 480, y, 9)
    body += line(48, y - 8, 564, y - 8)
    y -= 25
  })
  if (!items.length) body += text("Sin materiales registrados", 56, y, 10, "0.45 0.45 0.45")
  const signatureY = Math.min(y - 45, 190)
  body += text("Firma tecnico lider / solicitante", 48, signatureY, 9, "0.35 0.35 0.35")
  body += text("Firma ingeniero encargado", 226, signatureY, 9, "0.35 0.35 0.35")
  body += text("Firma responsable de bodega", 404, signatureY, 9, "0.35 0.35 0.35")
  body += line(48, signatureY + 26, 190, signatureY + 26, "0.25 0.25 0.25")
  body += line(226, signatureY + 26, 368, signatureY + 26, "0.25 0.25 0.25")
  body += line(404, signatureY + 26, 556, signatureY + 26, "0.25 0.25 0.25")
  body += text("Documento generado por SolarFlow", 48, 42, 8, "0.5 0.5 0.5")
  const objects = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>", `<< /Length ${body.length} >>\nstream\n${body}\nendstream`]
  let pdf = "%PDF-1.4\n"; const offsets = [0]
  objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n` })
  const xref = pdf.length
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }))
  const link = document.createElement("a"); link.href = url; link.download = `vale-${request.reference}.pdf`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 500)
}
