import type { MaterialRequest, Project, SiteMaterialReport } from "@/lib/types"

const safe = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[()\\]/g, " ").replace(/[^\x20-\x7E]/g, " ").slice(0, 82)
const txt = (value: string, x: number, y: number, size = 10, color = "0.12 0.12 0.12") => `${color} rg\nBT /F1 ${size} Tf ${x} ${y} Td (${safe(value)}) Tj ET\n`
const box = (x: number, y: number, width: number, height: number, color: string) => `${color} rg\n${x} ${y} ${width} ${height} re f\n`
const divider = (x1: number, y1: number, x2: number, y2: number) => `0.84 0.84 0.84 RG\n0.5 w\n${x1} ${y1} m ${x2} ${y2} l S\n`

export function downloadExecutiveReport(projects: Project[], requests: MaterialRequest[], reports: SiteMaterialReport[]) {
  let body = box(0, 690, 612, 102, "0.06 0.06 0.06") + box(0, 680, 612, 10, "1 0.31 0")
  body += txt("SOLARFLOW", 48, 750, 22, "1 0.31 0") + txt("Tecnologia Solar de Colombia", 48, 726, 11, "1 1 1")
  body += txt("REPORTE EJECUTIVO DE OBRAS", 48, 640, 19) + txt(`Generado: ${new Date().toLocaleDateString("es-CO")}`, 48, 616, 10, "0.4 0.4 0.4")
  body += box(48, 557, 155, 42, "0.96 0.96 0.96") + box(228, 557, 155, 42, "0.96 0.96 0.96") + box(408, 557, 155, 42, "0.96 0.96 0.96")
  body += txt("OBRAS ACTIVAS", 60, 580, 8, "0.4 0.4 0.4") + txt(String(projects.filter(p => p.status === "in_progress").length), 60, 564, 17, "1 0.31 0")
  body += txt("SOLICITUDES", 240, 580, 8, "0.4 0.4 0.4") + txt(String(requests.length), 240, 564, 17, "1 0.31 0")
  body += txt("REPORTES TECNICOS", 420, 580, 8, "0.4 0.4 0.4") + txt(String(reports.length), 420, 564, 17, "1 0.31 0")
  body += box(48, 510, 516, 25, "1 0.31 0") + txt("OBRA", 56, 519, 9, "1 1 1") + txt("ESTADO", 300, 519, 9, "1 1 1") + txt("SOLICITUDES", 390, 519, 9, "1 1 1") + txt("REPORTE TEC.", 475, 519, 9, "1 1 1")
  let y = 485
  projects.slice(0, 12).forEach((project, index) => {
    if (index % 2 === 0) body += box(48, y - 8, 516, 25, "0.97 0.97 0.97")
    const status = project.status === "in_progress" ? "En curso" : project.status === "completed" ? "Finalizado" : "Planificacion"
    body += txt(project.name, 56, y, 9) + txt(status, 300, y, 9) + txt(String(requests.filter(r => r.projectId === project.id).length), 405, y, 9) + txt(String(reports.filter(r => r.projectId === project.id).length), 505, y, 9) + divider(48, y - 8, 564, y - 8)
    y -= 25
  })
  body += txt("Este documento consolida las solicitudes y actas reportadas por los tecnicos lideres.", 48, 55, 8, "0.48 0.48 0.48")
  const objects = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>", `<< /Length ${body.length} >>\nstream\n${body}\nendstream`]
  let pdf = "%PDF-1.4\n"; const offsets = [0]; objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n` }); const xref = pdf.length
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" })); const link = document.createElement("a"); link.href = url; link.download = `reporte-ejecutivo-${new Date().toISOString().slice(0, 10)}.pdf`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 500)
}
