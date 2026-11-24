import { useEffect, useRef, useState } from 'react'
import { LOGO } from '@/lib/menu'

type Phase = 'night' | 'lit' | 'zoom' | 'open' | 'flash' | 'gone'

/* Intérieur vu à travers une vitrine : photo réelle de la salle, floutée par le verre */
function Interior({ x, w, photo, logo }: { x: number; w: number; photo: string; logo?: boolean }) {
  const y = 420, h = 470
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#0c0806" />
      <image className="interior" href={photo} x={x} y={y} width={w} height={h} preserveAspectRatio="xMidYMid slice" />
      <rect x={x} y={y} width={w} height={h} fill="url(#gNightGlass)" />
      {logo && (
        <g opacity=".92">
          <rect x={x + w / 2 - 105} y={y + 110} width="210" height="170" rx="14" fill="none" stroke="#f5efe5" strokeWidth="2.5" />
          <image href={LOGO} x={x + w / 2 - 80} y={y + 112} width="160" height="160" />
        </g>
      )}
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
            <pattern id="pDoor" patternUnits="userSpaceOnUse" x="676" y="416" width="248" height="476"><image href="/assets/photos/salle-c.webp" width="248" height="476" preserveAspectRatio="xMidYMid slice" /></pattern>
            <linearGradient id="gNightGlass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#120a04" stopOpacity=".15" /><stop offset=".7" stopColor="#0b0604" stopOpacity=".1" /><stop offset="1" stopColor="#050302" stopOpacity=".6" /></linearGradient>
            <linearGradient id="gSteel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8d8a84" /><stop offset=".5" stopColor="#e9e6df" /><stop offset="1" stopColor="#77736c" /></linearGradient>
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
          <Interior x={80} w={570} photo="/assets/photos/salle-a.webp" />
          <Interior x={950} w={570} photo="/assets/photos/salle-b.webp" logo />
          <rect x={80} y={420} width={570} height={470} fill="url(#gGlass)" />
          <rect x={950} y={420} width={570} height={470} fill="url(#gGlass)" />
          {[80, 270, 460, 650, 950, 1140, 1330, 1520].map(x => <rect key={x} x={x - 6} y={412} width="12" height="486" fill="#0b0b0c" />)}
          <rect x="74" y="412" width="582" height="10" fill="#0b0b0c" /><rect x="944" y="412" width="582" height="10" fill="#0b0b0c" />
          <rect x="74" y="886" width="582" height="14" fill="#0b0b0c" /><rect x="944" y="886" width="582" height="14" fill="#0b0b0c" />

          {/* Porte */}
          <rect x="676" y="416" width="248" height="476" fill="url(#gDoorLight)" className="door-light" />
          <rect ref={door} x="676" y="416" width="248" height="476" fill="none" />
          <g className="door-leaf door-l">
            <rect x="676" y="416" width="124" height="476" fill="#0a0a0b" />
            <rect x="686" y="428" width="104" height="452" fill="url(#pDoor)" className="interior" />
            <rect x="686" y="428" width="104" height="452" fill="url(#gNightGlass)" />
            <rect x="686" y="428" width="104" height="452" fill="url(#gGlass)" />
            <rect x="770" y="560" width="7" height="170" rx="3.5" fill="url(#gSteel)" />
          </g>
          <g className="door-leaf door-r">
            <rect x="800" y="416" width="124" height="476" fill="#0a0a0b" />
            <rect x="810" y="428" width="104" height="452" fill="url(#pDoor)" className="interior" />
            <rect x="810" y="428" width="104" height="452" fill="url(#gNightGlass)" />
            <rect x="810" y="428" width="104" height="452" fill="url(#gGlass)" />
            <rect x="823" y="560" width="7" height="170" rx="3.5" fill="url(#gSteel)" />
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
