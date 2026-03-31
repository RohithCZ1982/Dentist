import { useState, useCallback } from 'react'
import ImageUploadZone from './ImageUploadZone'
import XRayViewer from './XRayViewer'
import FindingsSidebar from './FindingsSidebar'
import { exportToPDF } from '../utils/pdf'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function AnalysisModule({ tab }) {
  const [imageFile, setImageFile] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [findings, setFindings] = useState([])
  const [findingStates, setFindingStates] = useState({}) // 'confirmed' | 'dismissed' | null per index
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [analyzed, setAnalyzed] = useState(false)
  const [patientName, setPatientName] = useState('')
  const [selectedFinding, setSelectedFinding] = useState(null)
  const [exporting, setExporting] = useState(false)

  const handleImageSelect = useCallback((file) => {
    setImageFile(file)
    setImageUrl(URL.createObjectURL(file))
    setFindings([])
    setFindingStates({})
    setAnalyzed(false)
    setError(null)
    setSelectedFinding(null)
  }, [])

  const handleAnalyze = async () => {
    if (!imageFile) return
    setLoading(true)
    setError(null)
    setFindings([])
    setFindingStates({})
    setSelectedFinding(null)

    try {
      const formData = new FormData()
      formData.append('image', imageFile)

      const response = await fetch(`${API_BASE}/analyze/${tab.endpoint}`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        let msg = `Server error ${response.status}`
        try {
          const err = await response.json()
          msg = err.detail || msg
        } catch (_) {}
        throw new Error(msg)
      }

      const data = await response.json()
      setFindings(data.findings || [])
      setAnalyzed(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleFinding = (index, action) => {
    setFindingStates((prev) => ({
      ...prev,
      [index]: prev[index] === action ? null : action,
    }))
  }

  const handleExport = async () => {
    if (!imageUrl || !findings.length) return
    setExporting(true)
    try {
      await exportToPDF({
        patientName: patientName.trim() || 'Unknown Patient',
        analysisType: tab.label,
        imageUrl,
        findings,
        findingStates,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      })
    } finally {
      setExporting(false)
    }
  }

  const handleReset = () => {
    setImageFile(null)
    setImageUrl(null)
    setFindings([])
    setFindingStates({})
    setAnalyzed(false)
    setError(null)
    setSelectedFinding(null)
  }

  const confirmedCount = Object.values(findingStates).filter((v) => v === 'confirmed').length
  const dismissedCount = Object.values(findingStates).filter((v) => v === 'dismissed').length

  return (
    <div className="space-y-4 slide-in">
      {/* Description bar */}
      <div
        className="rounded-lg px-4 py-3 flex items-center justify-between border"
        style={{ backgroundColor: '#161b22', borderColor: '#21262d' }}
      >
        <p className="text-sm" style={{ color: '#8b949e' }}>
          <span className="font-medium" style={{ color: tab.accentColor }}>
            {tab.label}
          </span>{' '}
          — {tab.description}
        </p>

        {analyzed && findings.length > 0 && (
          <div className="hidden sm:flex items-center gap-3 text-xs shrink-0 ml-4">
            <span className="text-green-400">{confirmedCount} confirmed</span>
            <span style={{ color: '#484f58' }}>·</span>
            <span className="text-red-400">{dismissedCount} dismissed</span>
            <span style={{ color: '#484f58' }}>·</span>
            <span style={{ color: '#8b949e' }}>
              {findings.length - confirmedCount - dismissedCount} pending
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column: upload + viewer + controls */}
        <div className="lg:col-span-2 space-y-4">
          {!imageUrl ? (
            <ImageUploadZone onImageSelect={handleImageSelect} />
          ) : (
            <div
              className="rounded-lg overflow-hidden border"
              style={{ backgroundColor: '#161b22', borderColor: '#21262d' }}
            >
              {/* Image toolbar */}
              <div
                className="flex items-center justify-between px-4 py-2.5 border-b"
                style={{ borderColor: '#21262d' }}
              >
                <div
                  className="flex items-center gap-2 text-sm min-w-0"
                  style={{ color: '#8b949e' }}
                >
                  <span className="text-green-500 shrink-0">●</span>
                  <span
                    className="font-medium truncate max-w-xs"
                    style={{ color: '#c9d1d9' }}
                  >
                    {imageFile?.name}
                  </span>
                  <span style={{ color: '#484f58' }}>·</span>
                  <span className="shrink-0">
                    {(imageFile?.size / 1024).toFixed(0)} KB
                  </span>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs transition-colors hover:text-white shrink-0"
                  style={{ color: '#8b949e' }}
                >
                  Change
                </button>
              </div>

              <XRayViewer
                imageUrl={imageUrl}
                findings={findings}
                selectedFinding={selectedFinding}
                onFindingSelect={setSelectedFinding}
                loading={loading}
              />
            </div>
          )}

          {/* Patient info + action bar */}
          {imageUrl && (
            <div
              className="rounded-lg p-4 border"
              style={{ backgroundColor: '#161b22', borderColor: '#21262d' }}
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Patient name (optional — used in PDF report)"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="flex-1 rounded-md px-3 py-2 text-sm outline-none transition-colors border"
                  style={{
                    backgroundColor: '#0d1117',
                    borderColor: '#30363d',
                    color: '#c9d1d9',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#388bfd')}
                  onBlur={(e) => (e.target.style.borderColor = '#30363d')}
                />
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={handleAnalyze}
                    disabled={loading || !imageFile}
                    className="px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: loading ? '#1e3a5f' : '#1f6feb',
                      color: loading ? '#8b949e' : '#ffffff',
                    }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Analyzing…
                      </span>
                    ) : analyzed ? (
                      'Re-Analyze'
                    ) : (
                      'Analyze X-Ray'
                    )}
                  </button>

                  {analyzed && findings.length > 0 && (
                    <button
                      onClick={handleExport}
                      disabled={exporting}
                      className="px-4 py-2 rounded-md text-sm font-medium transition-colors border disabled:opacity-60"
                      style={{
                        backgroundColor: '#21262d',
                        borderColor: '#30363d',
                        color: '#c9d1d9',
                      }}
                    >
                      {exporting ? 'Exporting…' : '↓ PDF'}
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <div
                  className="mt-3 p-3 rounded-md text-sm border"
                  style={{
                    backgroundColor: '#2d0e0e',
                    borderColor: '#7f1d1d',
                    color: '#fca5a5',
                  }}
                >
                  <strong>Error:</strong> {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column: findings sidebar */}
        <div className="lg:col-span-1">
          <FindingsSidebar
            findings={findings}
            findingStates={findingStates}
            selectedFinding={selectedFinding}
            onFindingSelect={setSelectedFinding}
            onToggleFinding={toggleFinding}
            loading={loading}
            analyzed={analyzed}
            tab={tab}
          />
        </div>
      </div>
    </div>
  )
}
