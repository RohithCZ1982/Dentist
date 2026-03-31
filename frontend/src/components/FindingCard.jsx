const SEV_CONFIG = {
  high:     { label: 'High',     badge: { bg: '#2d0e0e', color: '#fca5a5', border: '#7f1d1d' }, dot: '#ef4444', bar: '#ef4444' },
  advanced: { label: 'Advanced', badge: { bg: '#2d0e0e', color: '#fca5a5', border: '#7f1d1d' }, dot: '#ef4444', bar: '#ef4444' },
  moderate: { label: 'Moderate', badge: { bg: '#2a1600', color: '#fcd34d', border: '#78350f' }, dot: '#f59e0b', bar: '#f59e0b' },
  low:      { label: 'Low',      badge: { bg: '#0d2b1c', color: '#86efac', border: '#166534' }, dot: '#10b981', bar: '#10b981' },
  early:    { label: 'Early',    badge: { bg: '#0d2b1c', color: '#86efac', border: '#166534' }, dot: '#10b981', bar: '#10b981' },
}

function ConfidenceBar({ value, color }) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0))
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height: 5, backgroundColor: '#21262d' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="text-[11px] font-mono w-8 text-right shrink-0"
        style={{ color: '#8b949e' }}
      >
        {pct}%
      </span>
    </div>
  )
}

export default function FindingCard({
  index,
  finding,
  state,
  isSelected,
  onSelect,
  onConfirm,
  onDismiss,
}) {
  const sev = (finding.severity || 'low').toLowerCase()
  const cfg = SEV_CONFIG[sev] || SEV_CONFIG.low
  const isDismissed = state === 'dismissed'
  const isConfirmed = state === 'confirmed'

  return (
    <div
      onClick={onSelect}
      className="rounded-lg border transition-all duration-200 cursor-pointer"
      style={{
        backgroundColor: isSelected ? '#0d1b2e' : '#0d1117',
        borderColor: isSelected ? '#388bfd' : isDismissed ? '#21262d' : '#21262d',
        opacity: isDismissed ? 0.45 : 1,
        boxShadow: isSelected ? '0 0 0 1px #388bfd33' : 'none',
      }}
    >
      <div className="p-3 space-y-2.5">
        {/* Row 1: number + condition + severity badge */}
        <div className="flex items-start gap-2">
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
            style={
              isSelected
                ? { backgroundColor: '#388bfd', color: '#fff' }
                : { backgroundColor: '#21262d', color: '#8b949e' }
            }
          >
            {index + 1}
          </span>

          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium leading-tight truncate"
              style={{ color: isDismissed ? '#484f58' : '#c9d1d9' }}
            >
              {finding.condition || 'Unknown Condition'}
            </p>
          </div>

          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0"
            style={{
              backgroundColor: cfg.badge.bg,
              color: cfg.badge.color,
              borderColor: cfg.badge.border,
            }}
          >
            {cfg.label}
          </span>
        </div>

        {/* Region tag */}
        {finding.region && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wide" style={{ color: '#484f58' }}>
              Region
            </span>
            <span
              className="text-xs font-mono px-1.5 py-0.5 rounded"
              style={{ backgroundColor: 'rgba(56,139,253,0.1)', color: '#79c0ff' }}
            >
              {finding.region}
            </span>
          </div>
        )}

        {/* Confidence */}
        <div>
          <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: '#484f58' }}>
            Confidence
          </p>
          <ConfidenceBar value={finding.confidence} color={cfg.bar} />
        </div>

        {/* Description */}
        {finding.description && (
          <p
            className="text-[11px] leading-relaxed"
            style={{
              color: '#8b949e',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {finding.description}
          </p>
        )}

        {/* Action buttons */}
        <div
          className="flex gap-1.5 pt-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onConfirm}
            className="flex-1 py-1 rounded text-[11px] font-medium transition-all duration-150 border"
            style={
              isConfirmed
                ? { backgroundColor: '#166534', color: '#86efac', borderColor: '#166534' }
                : { backgroundColor: 'transparent', color: '#8b949e', borderColor: '#30363d' }
            }
          >
            {isConfirmed ? '✓ Confirmed' : 'Confirm'}
          </button>
          <button
            onClick={onDismiss}
            className="flex-1 py-1 rounded text-[11px] font-medium transition-all duration-150 border"
            style={
              isDismissed
                ? { backgroundColor: '#7f1d1d', color: '#fca5a5', borderColor: '#7f1d1d' }
                : { backgroundColor: 'transparent', color: '#8b949e', borderColor: '#30363d' }
            }
          >
            {isDismissed ? '✗ Dismissed' : 'Dismiss'}
          </button>
        </div>
      </div>
    </div>
  )
}
