export default function Header() {
  return (
    <header
      className="border-b px-6 py-4"
      style={{ backgroundColor: '#0d1117', borderColor: '#21262d' }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
            style={{ backgroundColor: '#1f6feb' }}
          >
            🦷
          </div>
          <div>
            <h1 className="text-base font-semibold text-white leading-tight">DentalAI</h1>
            <p className="text-xs" style={{ color: '#8b949e' }}>
              X-Ray Diagnosis Assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-xs" style={{ color: '#8b949e' }}>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Claude Vision Active
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono border"
              style={{ backgroundColor: '#161b22', borderColor: '#30363d', color: '#8b949e' }}>
              v1.0
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
