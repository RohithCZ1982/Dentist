import jsPDF from 'jspdf'

const SEV_COLORS = {
  high:     [239, 68,  68],
  advanced: [239, 68,  68],
  moderate: [245, 158, 11],
  low:      [16,  185, 129],
  early:    [16,  185, 129],
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

export async function exportToPDF({
  patientName,
  analysisType,
  imageUrl,
  findings,
  findingStates,
  date,
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const M = 16 // margin
  let y = M

  /* ── Header bar ───────────────────────────────── */
  doc.setFillColor(8, 12, 20)
  doc.rect(0, 0, W, 32, 'F')

  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('DentalAI', M, 15)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(139, 148, 158)
  doc.text('X-Ray Diagnosis Report', M, 23)

  doc.setFontSize(8)
  doc.setTextColor(139, 148, 158)
  doc.text(date, W - M, 15, { align: 'right' })
  doc.text(analysisType, W - M, 23, { align: 'right' })

  y = 40

  /* ── Patient card ─────────────────────────────── */
  doc.setFillColor(22, 27, 34)
  doc.roundedRect(M, y, W - M * 2, 18, 2, 2, 'F')

  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(139, 148, 158)
  doc.text('PATIENT', M + 5, y + 6)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(230, 237, 243)
  doc.text(patientName, M + 5, y + 13)

  const confirmed = Object.values(findingStates).filter((v) => v === 'confirmed').length
  const dismissed = Object.values(findingStates).filter((v) => v === 'dismissed').length
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(139, 148, 158)
  doc.text(
    `${findings.length} findings  ·  ${confirmed} confirmed  ·  ${dismissed} dismissed`,
    W - M - 5,
    y + 13,
    { align: 'right' }
  )

  y += 24

  /* ── X-ray image ──────────────────────────────── */
  try {
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.crossOrigin = 'anonymous'
      img.src = imageUrl
    })

    const availW = W - M * 2
    const availH = 85
    const scale = Math.min(availW / img.width, availH / img.height)
    const drawW = img.width * scale
    const drawH = img.height * scale
    const offsetX = M + (availW - drawW) / 2

    const cvs = document.createElement('canvas')
    cvs.width = img.width
    cvs.height = img.height
    cvs.getContext('2d').drawImage(img, 0, 0)
    const dataUrl = cvs.toDataURL('image/jpeg', 0.88)

    doc.setFillColor(0, 0, 0)
    doc.rect(M, y, availW, availH, 'F')
    doc.addImage(dataUrl, 'JPEG', offsetX, y, drawW, drawH)
    doc.setDrawColor(33, 38, 45)
    doc.rect(M, y, availW, availH)

    y += availH + 8
  } catch (_) {
    // Skip image if unavailable
  }

  /* ── Section heading ──────────────────────────── */
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(230, 237, 243)
  doc.text('AI Findings', M, y)
  y += 7

  if (findings.length === 0) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(74, 222, 128)
    doc.text('No pathology detected in this radiograph.', M, y)
    y += 6
  }

  /* ── Finding cards ────────────────────────────── */
  findings.forEach((finding, i) => {
    if (y > 268) {
      doc.addPage()
      y = M
    }

    const state = findingStates[i]
    const sev = (finding.severity || 'low').toLowerCase()
    const [r, g, b] = SEV_COLORS[sev] || SEV_COLORS.low
    const descLines = finding.description
      ? doc.splitTextToSize(finding.description, W - M * 2 - 22)
      : []
    const descLineCount = Math.min(descLines.length, 2)
    const cardH = 20 + (descLineCount > 0 ? 4 * descLineCount : 0)

    // Card background
    const dimmed = state === 'dismissed'
    doc.setFillColor(dimmed ? 14 : 22, dimmed ? 14 : 27, dimmed ? 14 : 34)
    doc.roundedRect(M, y, W - M * 2, cardH, 2, 2, 'F')

    // Left accent strip
    doc.setFillColor(r, g, b)
    doc.roundedRect(M, y, 3, cardH, 1, 1, 'F')

    // Number badge
    doc.setFillColor(r, g, b)
    doc.circle(M + 11, y + 8, 4.5, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text(String(i + 1), M + 11, y + 9.5, { align: 'center' })

    // Condition name
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(dimmed ? 80 : 230, dimmed ? 80 : 237, dimmed ? 80 : 243)
    doc.text(finding.condition || 'Unknown', M + 19, y + 8)

    // Region
    if (finding.region) {
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(99, 153, 255)
      doc.text(finding.region, M + 19, y + 14)
    }

    // Confidence + severity
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(139, 148, 158)
    doc.text(`${finding.confidence ?? 0}% confidence`, W - M - 4, y + 8, { align: 'right' })
    doc.setTextColor(r, g, b)
    doc.text(sev.charAt(0).toUpperCase() + sev.slice(1), W - M - 4, y + 14, { align: 'right' })

    // State badge
    if (state) {
      const isConf = state === 'confirmed'
      doc.setFontSize(7)
      doc.setTextColor(isConf ? 74 : 239, isConf ? 222 : 68, isConf ? 128 : 68)
      doc.text(isConf ? '✓ Confirmed' : '✗ Dismissed', W - M - 4, y + 19, { align: 'right' })
    }

    // Description
    if (descLineCount > 0) {
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(139, 148, 158)
      descLines.slice(0, 2).forEach((line, li) => {
        doc.text(line, M + 19, y + 19 + li * 4)
      })
    }

    y += cardH + 3
  })

  /* ── Footer on every page ─────────────────────── */
  const pages = doc.internal.getNumberOfPages()
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p)
    doc.setFontSize(7)
    doc.setTextColor(72, 79, 88)
    doc.text(
      'Generated by DentalAI  ·  For clinical support only  ·  Not a substitute for professional diagnosis',
      W / 2,
      292,
      { align: 'center' }
    )
    doc.text(`Page ${p} / ${pages}`, W - M, 292, { align: 'right' })
  }

  const safeName = patientName
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
  doc.save(`dental-report-${safeName || 'patient'}-${Date.now()}.pdf`)
}
