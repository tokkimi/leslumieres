import { useEffect, useRef, useState } from 'react'
import { LOGO } from '@/lib/menu'

type Phase = 'night' | 'lit' | 'zoom' | 'open' | 'flash' | 'gone'

/* Guirlande : ampoules réparties sur une chaînette entre x0 et x1 */
function Garland({ x0, x1, y, sag, n }: { x0: number; x1: number; y: number; sag: number; n: number }) {
  const pts = Array.from({ length: n }, (_, i) => {
    const t = (i + .5) / n
    return { x: x0 + (x1 - x0) * t, y: y + 4 * sag * t * (1 - t) }
  })
  return (
    <g>
      <path d={`M${x0} ${y} Q ${(x0 + x1) / 2} ${y + 2 * sag} ${x1} ${y}`} stroke="#1a120b" strokeWidth="1.5" fill="none" />
      {pts.map((p, i) => <circle key={i} className="bulb" cx={p.x} cy={p.y + 6} r="4.5" fill="#ffd590" filter="url(#glow)" />)}
    </g>
  )
}

/* Intérieur vu à travers une vitrine */
function Interior({ x, w, logo }: { x: number; w: number; logo?: boolean }) {
  const y = 420, h = 470
  return (
    <g className="interior">
      <rect x={x} y={y} width={w} height={h} fill="url(#pBrick)" />
      <rect x={x} y={y} width={w} height={h} fill="url(#gWarm)" />
      <rect x={x} y={y} width={w} height="18" fill="#2a1a10" />
      <rect x={x} y={y + 16} width={w} height="3" fill="#ffe0a8" filter="url(#glow)" />
      <Garland x0={x + 10} x1={x + w - 10} y={y + 40} sag={22} n={Math.round(w / 34)} />
      {[.25, .7].map((f, i) => (
        <g key={i}>
          <line x1={x + w * f} y1={y} x2={x + w * f} y2={y + 92 + i * 16} stroke="#111" strokeWidth="1.5" />
          <circle cx={x + w * f} cy={y + 110 + i * 16} r="22" fill="url(#gGlobe)" filter="url(#glow)" />
        </g>
      ))}
      {/* tables et chaises */}
      {Array.from({ length: Math.round(w / 140) }, (_, i) => {
        const cx = x + 70 + i * 140
        return (
          <g key={i} opacity=".92">
            <rect x={cx - 46} y={y + 330} width="92" height="10" rx="2" fill="url(#pOak)" />
            <rect x={cx - 3} y={y + 340} width="6" height="70" fill="#141010" />
            <path d={`M${cx - 70} ${y + 300} v110 M${cx - 70} ${y + 350} h28 v60`} stroke="#120d0a" strokeWidth="6" fill="none" />
            <path d={`M${cx + 70} ${y + 300} v110 M${cx + 70} ${y + 350} h-28 v60`} stroke="#120d0a" strokeWidth="6" fill="none" />
          </g>
        )
      })}
      {logo && (
        <g>
          <rect x={x + w / 2 - 105} y={y + 120} width="210" height="170" rx="14" fill="none" stroke="#f5efe5" strokeWidth="3" opacity=".9" />
          <image href={LOGO} x={x + w / 2 - 80} y={y + 122} width="160" height="160" opacity=".95" />
        </g>
      )}
      <rect x={x} y={y + h - 80} width={w} height="80" fill="url(#gFloorFade)" />
    </g>
  )
}

export function Entrance({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>('night')
  const cam = useRef<HTMLDivElement>(null)
  const door = useRef<SVGRectElement>(null)
  const timers = useRef<number[]>([])
  const doneRef = useRef(false)

  const finish = () => {
    if (doneRef.current) return
    doneRef.current = true
    setPhase('gone')
    onDone()
  }

  const enter = () => {
    timers.current.forEach(clearTimeout)
    const c = cam.current, d = door.current
    if (c && d) {
      const cr = c.getBoundingClientRect(), dr = d.getBoundingClientRect()
      const ox = ((dr.left + dr.width / 2 - cr.left) / cr.width) * 100
      const oy = ((dr.top + dr.height / 2 - cr.top) / cr.height) * 100
      c.style.transformOrigin = `${ox}% ${oy}%`
      const scale = Math.max(cr.width / dr.width, cr.height / dr.height) * 1.15
      requestAnimationFrame(() => { c.style.transform = `scale(${scale})` })
    }
    setPhase('zoom')
    const t = (ms: number, f: () => void) => timers.current.push(window.setTimeout(f, ms))
    t(700, () => setPhase('open'))
    t(1750, () => setPhase('flash'))
    t(2450, finish)
  }

  useEffect(() => {
    document.body.classList.add('locked')
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { const id = window.setTimeout(finish, 300); return () => clearTimeout(id) }
    const t = (ms: number, f: () => void) => timers.current.push(window.setTimeout(f, ms))
    t(450, () => setPhase('lit'))
    t(2300, enter)
    return () => timers.current.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cls = ['entrance',
    phase !== 'night' && 'is-lit',
    ['zoom', 'open', 'flash', 'gone'].includes(phase) && 'is-zoom',
    ['open', 'flash', 'gone'].includes(phase) && 'is-open',
    ['flash', 'gone'].includes(phase) && 'is-flash',
    phase === 'gone' && 'is-gone'].filter(Boolean).join(' ')

  return (
    <div className={cls} role="dialog" aria-label="Entrée du restaurant" onTransitionEnd={e => { if (phase === 'gone' && e.target === e.currentTarget) document.body.classList.remove('locked') }}>
      <div className="entrance__cam" ref={cam}>
        <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <pattern id="pPlaster" patternUnits="userSpaceOnUse" width="420" height="420"><image href="/assets/textures/enduit.webp" width="420" height="420" /></pattern>
            <pattern id="pFacade" patternUnits="userSpaceOnUse" width="360" height="360"><image href="/assets/textures/facade.webp" width="360" height="360" /></pattern>
            <pattern id="pPavers" patternUnits="userSpaceOnUse" width="240" height="240"><image href="/assets/textures/trottoir.webp" width="240" height="240" /></pattern>
            <pattern id="pBrick" patternUnits="userSpaceOnUse" width="300" height="300"><image href="/assets/textures/brique.webp" width="300" height="300" /></pattern>
            <pattern id="pOak" patternUnits="userSpaceOnUse" width="300" height="300"><image href="/assets/textures/chene.webp" width="300" height="300" /></pattern>
            <linearGradient id="gWarm" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffb866" stopOpacity=".55" />
              <stop offset=".5" stopColor="#c46a26" stopOpacity=".35" />
              <stop offset="1" stopColor="#140a04" stopOpacity=".85" />
            </linearGradient>
            <radialGradient id="gGlobe" cx=".4" cy=".35"><stop offset="0" stopColor="#fff" /><stop offset=".6" stopColor="#fff2da" /><stop offset="1" stopColor="#e9c99a" /></radialGradient>
            <linearGradient id="gFloorFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".7" /></linearGradient>
            <linearGradient id="gGlass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity=".12" /><stop offset=".25" stopColor="#fff" stopOpacity=".03" />
              <stop offset=".26" stopColor="#fff" stopOpacity="0" /><stop offset=".6" stopColor="#fff" stopOpacity=".05" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gAwning" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2c2e31" /><stop offset="1" stopColor="#151618" /></linearGradient>
            <linearGradient id="gFlap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1c1d20" /><stop offset=".85" stopColor="#121315" /><stop offset="1" stopColor="#0a0a0b" /></linearGradient>
            <radialGradient id="gDoorLight" cx=".5" cy=".6"><stop offset="0" stopColor="#fff3dd" /><stop offset=".55" stopColor="#f6c37a" /><stop offset="1" stopColor="#8a4a18" /></radialGradient>
            <radialGradient id="gVignette" cx=".5" cy=".55" r=".75"><stop offset=".55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".85" /></radialGradient>
            <linearGradient id="gTrunk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#4a4136" /><stop offset=".5" stopColor="#8c8170" /><stop offset="1" stopColor="#3b342b" /></linearGradient>
            <filter id="glow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>

          {/* Étage : enduit, balcon et plantes */}
          <rect width="1600" height="215" fill="url(#pPlaster)" />
          <rect width="1600" height="215" fill="#0d1016" opacity=".62" />
          <rect y="150" width="1600" height="6" fill="#2b2f36" />
          {Array.from({ length: 33 }, (_, i) => <rect key={i} x={i * 50} y="110" width="3" height="42" fill="#1f2228" />)}
          <rect y="106" width="1600" height="5" fill="#2b2f36" />
          {[120, 260, 430, 610, 1080, 1270, 1450].map((x, i) => (
            <g key={i} fill="#16231a" opacity=".9">
              <ellipse cx={x} cy="104" rx="60" ry="30" /><ellipse cx={x + 40} cy="92" rx="40" ry="26" /><ellipse cx={x - 30} cy="96" rx="34" ry="20" />
              <path d={`M${x} 110 q -10 60 6 120 M${x + 30} 108 q 8 50 -4 90`} stroke="#1b2b20" strokeWidth="3" fill="none" />
            </g>
          ))}
          <rect y="200" width="1600" height="40" fill="#cfccc4" />
          <rect y="200" width="1600" height="40" fill="#0f1218" opacity=".55" />

          {/* Mur de façade noir */}
          <rect y="240" width="1600" height="660" fill="url(#pFacade)" />
          <rect y="240" width="1600" height="660" fill="#09090a" opacity=".55" />

          {/* Vitrines et porte */}
          <Interior x={80} w={570} />
          <Interior x={950} w={570} logo />
          <rect x={80} y={420} width={570} height={470} fill="url(#gGlass)" />
          <rect x={950} y={420} width={570} height={470} fill="url(#gGlass)" />
          {[80, 270, 460, 650, 950, 1140, 1330, 1520].map(x => <rect key={x} x={x - 6} y={412} width="12" height="486" fill="#0b0b0c" />)}
          <rect x="74" y="412" width="582" height="10" fill="#0b0b0c" /><rect x="944" y="412" width="582" height="10" fill="#0b0b0c" />
          <rect x="74" y="886" width="582" height="14" fill="#0b0b0c" /><rect x="944" y="886" width="582" height="14" fill="#0b0b0c" />

          {/* Porte */}
          <rect x="676" y="416" width="248" height="476" fill="url(#gDoorLight)" className="door-light" />
          <rect ref={door} x="676" y="416" width="248" height="476" fill="none" />
          <g className="door-leaf door-l">
            <rect x="676" y="416" width="124" height="476" fill="#0d0d0e" />
            <rect x="688" y="430" width="100" height="448" fill="url(#pBrick)" />
            <rect x="688" y="430" width="100" height="448" fill="url(#gWarm)" className="interior" />
            <rect x="688" y="430" width="100" height="448" fill="url(#gGlass)" />
            <rect x="780" y="600" width="6" height="120" rx="3" fill="#b9b2a6" />
          </g>
          <g className="door-leaf door-r">
            <rect x="800" y="416" width="124" height="476" fill="#0d0d0e" />
            <rect x="812" y="430" width="100" height="448" fill="url(#pBrick)" />
            <rect x="812" y="430" width="100" height="448" fill="url(#gWarm)" className="interior" />
            <rect x="812" y="430" width="100" height="448" fill="url(#gGlass)" />
            <rect x="814" y="600" width="6" height="120" rx="3" fill="#b9b2a6" />
          </g>
          <rect x="666" y="404" width="268" height="14" fill="#0b0b0c" />
          <rect x="666" y="404" width="10" height="492" fill="#0b0b0c" /><rect x="924" y="404" width="10" height="492" fill="#0b0b0c" />

          {/* Le store, avec un peu de vent */}
          <g className="store">
            <polygon points="40,246 1560,246 1590,338 10,338" fill="url(#gAwning)" />
            {Array.from({ length: 31 }, (_, i) => <line key={i} x1={40 + i * 50.6} y1="246" x2={10 + i * 52.6} y2="338" stroke="#000" strokeOpacity=".22" strokeWidth="2" />)}
            <g className="store-flap">
              <path fill="url(#gFlap)">
                <animate attributeName="d" dur="5.5s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1;.45 0 .55 1"
                  values="M10 336 H1590 V392 Q1192 398 800 392 Q408 386 10 392 Z;M10 336 H1590 V394 Q1192 386 800 394 Q408 400 10 391 Z;M10 336 H1590 V391 Q1192 396 800 390 Q408 394 10 394 Z;M10 336 H1590 V392 Q1192 398 800 392 Q408 386 10 392 Z" />
              </path>
              <line x1="10" y1="339" x2="1590" y2="339" stroke="#3a3c40" strokeWidth="2" />
              <text x="250" y="374" fill="#f5efe5" fontFamily="Montserrat, sans-serif" fontWeight="600" fontSize="19" letterSpacing="5" textAnchor="middle">CUISINE DU MONDE</text>
              <text x="800" y="380" fill="#f5efe5" fontFamily="Yesteryear, cursive" fontSize="44" textAnchor="middle">Les Lumières</text>
              <text x="1350" y="374" fill="#f5efe5" fontFamily="Montserrat, sans-serif" fontWeight="600" fontSize="19" letterSpacing="5" textAnchor="middle">CAFÉ LITTÉRAIRE</text>
            </g>
          </g>

          {/* Trottoir, terrasse et arbre */}
          <rect y="896" width="1600" height="104" fill="url(#pPavers)" />
          <rect y="896" width="1600" height="104" fill="#06070a" opacity=".55" />
          <rect y="896" width="1600" height="5" fill="#000" opacity=".6" />
          {[150, 330, 1180].map((x, i) => (
            <g key={i} stroke="#0a0a0a" strokeWidth="5" fill="none" opacity=".95">
              <ellipse cx={x + 60} cy="930" rx="50" ry="7" fill="#2a2622" stroke="#111" strokeWidth="2" />
              <path d={`M${x + 60} 936 v50 m-24 0 h48`} />
              <path d={`M${x} 900 v90 M${x} 950 h26 v40`} /><path d={`M${x + 120} 900 v90 M${x + 120} 950 h-26 v40`} />
            </g>
          ))}
          <rect x="1548" y="230" width="46" height="770" fill="url(#gTrunk)" />
          <rect x="1548" y="230" width="46" height="770" fill="#000" opacity=".35" />
          <rect width="1600" height="1000" fill="url(#gVignette)" />
        </svg>
      </div>
      <div className="entrance__flash" />
      <div className="entrance__ui">
        <span className="entrance__hint">31-33 avenue Ampère · Champs-sur-Marne</span>
        <button type="button" className="entrance__skip" onClick={enter}>Entrer</button>
      </div>
    </div>
  )
}
