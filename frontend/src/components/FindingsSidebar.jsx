import FindingCard from './FindingCard'

export default function FindingsSidebar({
  findings,
  findingStates,
  selectedFinding,
  onFindingSelect,
  onToggleFinding,
  loading,
  analyzed,
  tab,
}) {
  return (
    <div
      className="rounded-lg border flex flex-col"
      style={{
        backgroundColor: '#161b22',
        borderColor: '#21262d',
        minHeight: 520,
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{ borderColor: '#21262d' }}
      >
        <h2 className="text-sm font-semibold" style={{ color: '#c9d1d9' }}>
          AI Findings
        </h2>
        {analyzed && !loading && (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium border"
            style={
              findings.length === 0
                ? { backgroundColor: '#0d2b1c', color: '#4ade80', borderColor: '#166534' }
                : { backgroundColor: '#2d0e0e', color: '#fca5a5', borderColor: '#7f1d1d' }
            }
          >
            {findings.length === 0
              ? 'No pathology'
              : `${findings.length} finding${findings.length !== 1 ? 's' : ''}`}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {/* Idle state */}
        {!analyzed && !loading && (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
            <span className="text-4xl opacity-20">🔍</span>
            <p className="text-sm" style={{ color: '#484f58' }}>
              Upload an X-ray and click{' '}
              <strong style={{ color: '#8b949e' }}>Analyze X-Ray</strong> to see
              AI findings here.
            </p>
          </div>
        )}

        {/* Skeleton loaders */}
        {loading && (
          <div className="p-3 space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-lg p-4 space-y-2"
                style={{ backgroundColor: '#0d1117' }}
              >
                <div className="skeleton h-3 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
                <div className="skeleton h-2 w-full rounded mt-2" />
                <div className="skeleton h-2 w-5/6 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Clean bill */}
        {analyzed && !loading && findings.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
            <span className="text-5xl">✅</span>
            <p className="text-sm font-semibold text-green-400">No pathology detected</p>
            <p className="text-xs" style={{ color: '#484f58' }}>
              The AI found no significant findings in this radiograph. Clinical
              correlation is always recommended.
            </p>
          </div>
        )}

        {/* Findings list */}
        {!loading && findings.length > 0 && (
          <div className="p-3 space-y-2">
            {findings.map((finding, i) => (
              <FindingCard
                key={i}
                index={i}
                finding={finding}
                state={findingStates[i] || null}
                isSelected={selectedFinding === i}
                onSelect={() => onFindingSelect(selectedFinding === i ? null : i)}
                onConfirm={() => onToggleFinding(i, 'confirmed')}
                onDismiss={() => onToggleFinding(i, 'dismissed')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer disclaimer */}
      {analyzed && findings.length > 0 && (
        <div
          className="px-4 py-2.5 border-t text-center text-[10px]"
          style={{ borderColor: '#21262d', color: '#484f58' }}
        >
          AI findings are for clinical support only. Always apply professional
          judgement.
        </div>
      )}
    </div>
  )
}
