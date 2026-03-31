import { useEffect, useRef, useState, useCallback } from 'react'

// Severity → color config
const SEV_COLOR = {
  high:     { fill: 'rgba(239,68,68,0.22)',   stroke: '#ef4444' },
  advanced: { fill: 'rgba(239,68,68,0.22)',   stroke: '#ef4444' },
  moderate: { fill: 'rgba(245,158,11,0.18)',  stroke: '#f59e0b' },
  low:      { fill: 'rgba(16,185,129,0.16)',  stroke: '#10b981' },
  early:    { fill: 'rgba(16,185,129,0.16)',  stroke: '#10b981' },
}

// Deterministic overlay positions (fractional: cx/cy = center, rw/rh = half-width/height)
const POSITIONS = [
  { cx: 0.22, cy: 0.30, rw: 0.09, rh: 0.07 },
  { cx: 0.55, cy: 0.38, rw: 0.08, rh: 0.06 },
  { cx: 0.76, cy: 0.26, rw: 0.08, rh: 0.08 },
  { cx: 0.34, cy: 0.62, rw: 0.09, rh: 0.07 },
  { cx: 0.64, cy: 0.66, rw: 0.07, rh: 0.07 },
  { cx: 0.17, cy: 0.54, rw: 0.08, rh: 0.06 },
  { cx: 0.83, cy: 0.50, rw: 0.07, rh: 0.08 },
  { cx: 0.45, cy: 0.76, rw: 0.08, rh: 0.06 },
  { cx: 0.61, cy: 0.18, rw: 0.07, rh: 0.07 },
  { cx: 0.30, cy: 0.20, rw: 0.08, rh: 0.06 },
]

function drawOverlay(canvas, findings, selected) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width
  const H = canvas.height
  ctx.clearRect(0, 0, W, H)

  findings.forEach((f, i) => {
    const pos = POSITIONS[i % POSITIONS.length]
    const colors = SEV_COLOR[(f.severity || 'low').toLowerCase()] || SEV_COLOR.low
    const isSelected = selected === i
    const cx = pos.cx * W
    const cy = pos.cy * H
    const rx = pos.rw * W
    const ry = pos.rh * H

    // Outer glow when selected
    if (isSelected) {
      ctx.save()
      ctx.globalAlpha = 0.35
      ctx.strokeStyle = colors.stroke
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.ellipse(cx, cy, rx + 10, ry + 7, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    // Fill
    ctx.save()
    ctx.globalAlpha = isSelected ? 0.55 : 0.35
    ctx.fillStyle = colors.fill
    ctx.beginPath()
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // Stroke (dashed for non-selected)
    ctx.save()
    ctx.globalAlpha = isSelected ? 1 : 0.75
    ctx.strokeStyle = colors.stroke
    ctx.lineWidth = isSelected ? 2.5 : 1.5
    ctx.setLineDash(isSelected ? [] : [5, 3])
    ctx.beginPath()
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()

    // Number badge
    const badgeR = 9
    const bx = cx + rx - 2
    const by = cy - ry - 2
    ctx.save()
    ctx.fillStyle = colors.stroke
    ctx.beginPath()
    ctx.arc(bx, by, badgeR, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#000'
    ctx.font = `bold 9px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(i + 1), bx, by)
    ctx.restore()
  })
}

export default function XRayViewer({ imageUrl, findings, selectedFinding, onFindingSelect, loading }) {
  const imgRef = useRef(null)
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [imgLoaded, setImgLoaded] = useState(false)

  const syncCanvas = useCallback(() => {
    const img = imgRef.current
    const canvas = canvasRef.current
    if (!img || !canvas || !imgLoaded) return
    canvas.width = img.clientWidth
    canvas.height = img.clientHeight
    if (findings.length > 0) drawOverlay(canvas, findings, selectedFinding)
    else {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [imgLoaded, findings, selectedFinding])

  useEffect(() => {
    syncCanvas()
    const ro = new ResizeObserver(syncCanvas)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [syncCanvas])

  const handleCanvasClick = useCallback(
    (e) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const mx = (e.clientX - rect.left) / canvas.clientWidth
      const my = (e.clientY - rect.top) / canvas.clientHeight

      let hit = null
      findings.forEach((_, i) => {
        const pos = POSITIONS[i % POSITIONS.length]
        const dx = (mx - pos.cx) / pos.rw
        const dy = (my - pos.cy) / pos.rh
        if (dx * dx + dy * dy <= 1) hit = i
      })
      onFindingSelect(hit === selectedFinding ? null : hit)
    },
    [findings, selectedFinding, onFindingSelect]
  )

  return (
    <div ref={containerRef} className="relative select-none" style={{ backgroundColor: '#000', minHeight: 360 }}>
      {/* X-ray image */}
      <img
        ref={imgRef}
        src={imageUrl}
        alt="Dental X-ray"
        onLoad={() => setImgLoaded(true)}
        className="w-full block"
        style={{ maxHeight: 560, objectFit: 'contain', objectPosition: 'center' }}
        draggable={false}
      />

      {/* Findings canvas */}
      {imgLoaded && findings.length > 0 && (
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            cursor: 'crosshair',
          }}
        />
      )}

      {/* Loading overlay */}
      {loading && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(3px)' }}
        >
          <div className="relative w-16 h-16">
            <div
              className="absolute inset-0 rounded-full border-4 animate-spin"
              style={{ borderColor: '#1e3a5f', borderTopColor: '#388bfd' }}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: '#79c0ff' }}>
              AI Analysis in Progress
            </p>
            <p className="text-xs mt-1" style={{ color: '#8b949e' }}>
              Claude Vision is examining the radiograph…
            </p>
          </div>
          <div className="flex items-end gap-1 h-6">
            {[12, 18, 14, 20, 12].map((h, i) => (
              <div
                key={i}
                className="w-1 rounded-full animate-pulse"
                style={{
                  height: h,
                  backgroundColor: '#388bfd',
                  animationDelay: `${i * 0.12}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Legend (shown after analysis) */}
      {findings.length > 0 && (
        <div className="absolute bottom-2 right-2 flex flex-col gap-1">
          {[
            { label: 'High / Advanced', color: '#ef4444' },
            { label: 'Moderate',        color: '#f59e0b' },
            { label: 'Low / Early',     color: '#10b981' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-1.5 rounded px-2 py-0.5"
              style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[10px]" style={{ color: '#8b949e' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Click hint */}
      {findings.length > 0 && !loading && (
        <div
          className="absolute top-2 left-2 rounded px-2 py-1 text-[10px]"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)', color: '#8b949e' }}
        >
          Click a marker to highlight finding
        </div>
      )}
    </div>
  )
}
