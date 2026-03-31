import { useEffect, useState } from 'react'

const MESSAGES = [
  'Waking up the server…',
  'Server is starting, hang tight…',
  'Cold start in progress…',
  'Almost there, server warming up…',
  'Connecting to AI engine…',
  'Just a few more seconds…',
]

// 3D Tooth SVG — molar shape, flat-design with depth planes
function Tooth3D({ style }) {
  return (
    <svg
      viewBox="0 0 80 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
    >
      {/* Shadow/depth back face */}
      <ellipse cx="40" cy="85" rx="22" ry="5" fill="rgba(56,139,253,0.15)" />

      {/* Root left */}
      <path
        d="M28 58 C26 68 24 78 23 85 C23 87 25 88 27 87 C29 82 31 72 32 62Z"
        fill="#1a2744"
        stroke="#2d4a8a"
        strokeWidth="1"
      />
      {/* Root right */}
      <path
        d="M52 58 C54 68 56 78 57 85 C57 87 55 88 53 87 C51 82 49 72 48 62Z"
        fill="#1a2744"
        stroke="#2d4a8a"
        strokeWidth="1"
      />
      {/* Root center */}
      <path
        d="M36 60 C36 70 37 80 38 86 C38 88 42 88 42 86 C43 80 44 70 44 60Z"
        fill="#1e2f5e"
        stroke="#2d4a8a"
        strokeWidth="1"
      />

      {/* Crown side shadow (3D depth) */}
      <path
        d="M60 20 C62 16 64 20 63 30 C62 40 61 50 60 58 L52 58 C53 50 54 38 54 28Z"
        fill="#0e1b3d"
        stroke="#1a2d5a"
        strokeWidth="1"
      />

      {/* Crown main body */}
      <path
        d="M20 30 C18 18 24 8 34 6 C38 5 42 5 46 6 C56 8 62 18 60 30
           C60 40 60 52 58 58 L22 58 C20 52 20 40 20 30Z"
        fill="url(#toothGrad)"
        stroke="#388bfd"
        strokeWidth="1.5"
      />

      {/* Crown cusps (bumps on top) */}
      <path
        d="M26 22 C24 14 30 8 36 10 C38 11 38 16 36 20Z"
        fill="url(#cuspGrad)"
        stroke="#4a9eff"
        strokeWidth="1"
      />
      <path
        d="M54 22 C56 14 50 8 44 10 C42 11 42 16 44 20Z"
        fill="url(#cuspGrad)"
        stroke="#4a9eff"
        strokeWidth="1"
      />
      <path
        d="M36 18 C34 10 40 6 44 9 C46 11 45 16 42 18Z"
        fill="url(#cuspGrad)"
        stroke="#4a9eff"
        strokeWidth="1"
      />

      {/* Crown highlight (shine) */}
      <ellipse cx="33" cy="26" rx="7" ry="10" fill="rgba(255,255,255,0.06)" transform="rotate(-15 33 26)" />
      <ellipse cx="31" cy="24" rx="3" ry="5"  fill="rgba(255,255,255,0.10)" transform="rotate(-15 31 24)" />

      {/* Fissure lines */}
      <path d="M35 35 C37 33 43 33 45 35" stroke="rgba(56,139,253,0.35)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M40 30 C40 36 40 44 40 50"  stroke="rgba(56,139,253,0.25)" strokeWidth="1"   fill="none" strokeLinecap="round"/>

      {/* Scan line (animated via CSS) */}
      <rect x="20" y="0" width="42" height="2" rx="1" fill="rgba(56,139,253,0.6)" className="scan-line" />

      <defs>
        <linearGradient id="toothGrad" x1="20" y1="6" x2="60" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#1e3a6e" />
          <stop offset="50%"  stopColor="#162d58" />
          <stop offset="100%" stopColor="#0d1b3a" />
        </linearGradient>
        <linearGradient id="cuspGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#2a4f8a" />
          <stop offset="100%" stopColor="#1a3060" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Small floating particle tooth
function MiniTooth({ style }) {
  return (
    <svg viewBox="0 0 40 46" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path
        d="M8 16 C7 9 11 4 17 3 C19 2.5 21 2.5 23 3 C29 4 33 9 32 16
           C32 22 31 28 30 30 L10 30 C9 28 8 22 8 16Z"
        fill="#1a2d58" stroke="#388bfd" strokeWidth="1"
      />
      <path d="M14 30 C13 36 12 41 12 43 C12 44 13 45 14 44 C15 41 16 36 16 31Z" fill="#131e3a" stroke="#2a4070" strokeWidth="0.8"/>
      <path d="M26 30 C27 36 28 41 28 43 C28 44 27 45 26 44 C25 41 24 36 24 31Z" fill="#131e3a" stroke="#2a4070" strokeWidth="0.8"/>
      <ellipse cx="17" cy="13" rx="4" ry="5" fill="rgba(255,255,255,0.05)" transform="rotate(-10 17 13)"/>
    </svg>
  )
}

export default function BackendWakeup({ visible, elapsed }) {
  const [msgIdx, setMsgIdx] = useState(0)
  const [dots, setDots]     = useState('')

  useEffect(() => {
    if (!visible) { setMsgIdx(0); setDots(''); return }
    const msgTimer = setInterval(() => setMsgIdx(i => (i + 1) % MESSAGES.length), 4000)
    const dotTimer = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500)
    return () => { clearInterval(msgTimer); clearInterval(dotTimer) }
  }, [visible])

  if (!visible) return null

  const pct = Math.min(100, Math.round((elapsed / 35) * 100))

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(8,12,20,0.92)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <style>{`
        @keyframes float-main {
          0%,100% { transform: translateY(0px)   rotateY(0deg)   rotateZ(0deg); }
          25%      { transform: translateY(-18px) rotateY(12deg)  rotateZ(3deg); }
          50%      { transform: translateY(-8px)  rotateY(-8deg)  rotateZ(-2deg); }
          75%      { transform: translateY(-22px) rotateY(18deg)  rotateZ(4deg); }
        }
        @keyframes float-1 {
          0%,100% { transform: translate(0,0)     rotate(0deg)   scale(1); }
          33%     { transform: translate(8px,-20px) rotate(25deg) scale(1.1); }
          66%     { transform: translate(-6px,-12px) rotate(-15deg) scale(0.9); }
        }
        @keyframes float-2 {
          0%,100% { transform: translate(0,0)     rotate(0deg); }
          50%     { transform: translate(-10px,-24px) rotate(-30deg); }
        }
        @keyframes float-3 {
          0%,100% { transform: translate(0,0)     rotate(0deg) scale(1); }
          40%     { transform: translate(12px,-16px) rotate(20deg) scale(1.15); }
          80%     { transform: translate(-4px,-28px) rotate(-10deg) scale(0.85); }
        }
        @keyframes float-4 {
          0%,100% { transform: translate(0,0)   rotate(0deg); }
          60%     { transform: translate(-8px,-20px) rotate(35deg); }
        }
        @keyframes float-5 {
          0%,100% { transform: translate(0,0)    rotate(0deg) scale(1); }
          45%     { transform: translate(6px,-18px) rotate(-20deg) scale(1.2); }
        }
        @keyframes scan-line {
          0%   { transform: translateY(0px);   opacity: 0.8; }
          100% { transform: translateY(88px);  opacity: 0; }
        }
        @keyframes ring-rotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes ring-counter {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes pulse-glow {
          0%,100% { opacity: 0.4; transform: scale(1); }
          50%     { opacity: 0.8; transform: scale(1.06); }
        }
        @keyframes progress-fill {
          from { width: 0%; }
        }
        .scan-line { animation: scan-line 2s ease-in infinite; }
        .float-main { animation: float-main 4s ease-in-out infinite; }
        .ring-outer  { animation: ring-rotate 3s linear infinite; }
        .ring-inner  { animation: ring-counter 2s linear infinite; }
        .glow-pulse  { animation: pulse-glow 2s ease-in-out infinite; }
      `}</style>

      {/* Ambient glow blob */}
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(31,111,235,0.12) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        pointerEvents: 'none',
      }} className="glow-pulse" />

      {/* Floating mini teeth */}
      {[
        { top: '18%', left: '18%', size: 28, delay: '0s',    anim: 'float-1 5.2s ease-in-out infinite', opacity: 0.35 },
        { top: '14%', left: '72%', size: 22, delay: '0.8s',  anim: 'float-2 6.1s ease-in-out infinite', opacity: 0.25 },
        { top: '72%', left: '14%', size: 32, delay: '1.4s',  anim: 'float-3 4.8s ease-in-out infinite', opacity: 0.30 },
        { top: '76%', left: '76%', size: 24, delay: '0.3s',  anim: 'float-4 5.6s ease-in-out infinite', opacity: 0.28 },
        { top: '44%', left: '8%',  size: 18, delay: '2.1s',  anim: 'float-5 7.0s ease-in-out infinite', opacity: 0.20 },
        { top: '40%', left: '88%', size: 20, delay: '1.0s',  anim: 'float-1 5.8s ease-in-out infinite', opacity: 0.22 },
        { top: '88%', left: '44%', size: 26, delay: '1.7s',  anim: 'float-2 6.4s ease-in-out infinite', opacity: 0.18 },
        { top: '8%',  left: '46%', size: 16, delay: '0.5s',  anim: 'float-3 5.0s ease-in-out infinite', opacity: 0.20 },
      ].map((t, i) => (
        <div key={i} style={{
          position: 'absolute', top: t.top, left: t.left,
          width: t.size, height: t.size,
          animation: t.anim,
          animationDelay: t.delay,
          opacity: t.opacity,
          filter: 'blur(0.5px)',
        }}>
          <MiniTooth style={{ width: '100%', height: '100%' }} />
        </div>
      ))}

      {/* Main card */}
      <div style={{
        position: 'relative', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 0,
        background: 'rgba(13,17,23,0.85)',
        border: '1px solid rgba(56,139,253,0.25)',
        borderRadius: 20,
        padding: '48px 52px 40px',
        boxShadow: '0 0 60px rgba(31,111,235,0.12), 0 24px 60px rgba(0,0,0,0.5)',
        minWidth: 320, textAlign: 'center',
      }}>

        {/* Spinning rings + tooth */}
        <div style={{ position: 'relative', width: 140, height: 140, marginBottom: 32 }}>

          {/* Outer dashed ring */}
          <svg className="ring-outer" viewBox="0 0 140 140" style={{
            position: 'absolute', inset: 0, width: 140, height: 140,
          }}>
            <circle cx="70" cy="70" r="64"
              fill="none" stroke="rgba(56,139,253,0.2)" strokeWidth="1.5"
              strokeDasharray="8 6" />
            <circle cx="70" cy="70" r="64"
              fill="none" stroke="rgba(56,139,253,0.6)" strokeWidth="1.5"
              strokeDasharray="30 170" strokeLinecap="round" />
          </svg>

          {/* Inner ring */}
          <svg className="ring-inner" viewBox="0 0 140 140" style={{
            position: 'absolute', inset: 8, width: 124, height: 124,
          }}>
            <circle cx="62" cy="62" r="55"
              fill="none" stroke="rgba(56,139,253,0.12)" strokeWidth="1"
              strokeDasharray="4 8" />
            <circle cx="62" cy="62" r="55"
              fill="none" stroke="rgba(99,179,255,0.4)" strokeWidth="1"
              strokeDasharray="16 184" strokeLinecap="round" />
          </svg>

          {/* Glow behind tooth */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 90, height: 90, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(31,111,235,0.18) 0%, transparent 70%)',
          }} className="glow-pulse" />

          {/* Main 3D tooth */}
          <div className="float-main" style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 72, height: 80,
            filter: 'drop-shadow(0 8px 20px rgba(56,139,253,0.4))',
            perspective: 400,
          }}>
            <Tooth3D style={{ width: '100%', height: '100%' }} />
          </div>

          {/* Corner tick marks */}
          {[0,90,180,270].map(deg => (
            <div key={deg} style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 8, height: 2, borderRadius: 1,
              background: `rgba(56,139,253,${deg === 0 ? '0.8' : '0.3'})`,
              transformOrigin: '-62px 50%',
              transform: `translate(-50%,-50%) rotate(${deg}deg) translateX(66px)`,
            }}/>
          ))}
        </div>

        {/* Status text */}
        <p style={{ fontSize: 18, fontWeight: 700, color: '#e6edf3', marginBottom: 6 }}>
          Server Waking Up
        </p>
        <p style={{ fontSize: 13, color: '#8b949e', marginBottom: 24, minHeight: 20 }}>
          {MESSAGES[msgIdx]}{dots}
        </p>

        {/* Progress bar */}
        <div style={{
          width: '100%', height: 4, borderRadius: 2,
          background: 'rgba(56,139,253,0.12)',
          marginBottom: 14, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 2,
            background: 'linear-gradient(90deg, #1f6feb, #388bfd, #79c0ff)',
            width: `${pct}%`,
            transition: 'width 1s linear',
            boxShadow: '0 0 8px rgba(56,139,253,0.6)',
          }} />
        </div>

        {/* Elapsed */}
        <p style={{ fontSize: 11, color: '#484f58' }}>
          {elapsed}s elapsed · Render free tier cold start (~30s)
        </p>

        {/* Pulsing dots */}
        <div style={{ display: 'flex', gap: 6, marginTop: 20 }}>
          {[0, 0.2, 0.4].map((delay, i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#388bfd',
              animation: `pulse-glow 1.2s ease-in-out ${delay}s infinite`,
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}
