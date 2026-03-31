import { useState, useRef, useCallback } from 'react'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function ImageUploadZone({ onImageSelect }) {
  const [dragging, setDragging] = useState(false)
  const [dragError, setDragError] = useState(null)
  const inputRef = useRef(null)

  const validate = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Unsupported file type. Please use JPEG, PNG, or WebP.'
    }
    if (file.size > 10 * 1024 * 1024) {
      return 'File too large. Maximum size is 10 MB.'
    }
    return null
  }

  const handleFile = useCallback(
    (file) => {
      const err = validate(file)
      if (err) {
        setDragError(err)
        return
      }
      setDragError(null)
      onImageSelect(file)
    },
    [onImageSelect]
  )

  const onDrop = useCallback(
    (e) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const onDragLeave = useCallback(() => setDragging(false), [])

  const onFileChange = useCallback(
    (e) => {
      const file = e.target.files[0]
      if (file) handleFile(file)
      e.target.value = ''
    },
    [handleFile]
  )

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => inputRef.current?.click()}
      className="relative flex flex-col items-center justify-center min-h-[420px] rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200"
      style={{
        borderColor: dragging ? '#388bfd' : '#30363d',
        backgroundColor: dragging ? 'rgba(31,111,235,0.07)' : '#0d1117',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={onFileChange}
      />

      <div className="flex flex-col items-center gap-5 p-10 text-center pointer-events-none">
        {/* Icon */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl transition-all duration-200"
          style={{
            backgroundColor: dragging ? 'rgba(31,111,235,0.15)' : '#161b22',
          }}
        >
          🩻
        </div>

        <div>
          <p className="text-base font-semibold mb-1" style={{ color: '#c9d1d9' }}>
            {dragging ? 'Release to upload' : 'Upload Dental X-Ray'}
          </p>
          <p className="text-sm" style={{ color: '#8b949e' }}>
            Drag & drop or{' '}
            <span style={{ color: '#388bfd' }} className="pointer-events-auto">
              browse files
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {['JPEG', 'PNG', 'WebP', 'max 10 MB'].map((label) => (
            <span
              key={label}
              className="px-2.5 py-1 text-xs font-mono rounded-md border"
              style={{
                backgroundColor: '#161b22',
                borderColor: '#30363d',
                color: '#8b949e',
              }}
            >
              {label}
            </span>
          ))}
        </div>

        <p className="text-xs max-w-xs" style={{ color: '#484f58' }}>
          Supports bitewing, periapical, and panoramic radiograph images
        </p>
      </div>

      {/* Grid decoration */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none opacity-[0.04]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              'linear-gradient(rgba(59,130,246,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {dragError && (
        <div
          className="absolute bottom-4 left-4 right-4 p-3 rounded-lg border text-sm text-center"
          style={{
            backgroundColor: '#2d0e0e',
            borderColor: '#7f1d1d',
            color: '#fca5a5',
          }}
        >
          {dragError}
        </div>
      )}
    </div>
  )
}
