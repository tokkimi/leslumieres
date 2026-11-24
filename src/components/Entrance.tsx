import { useEffect, useRef, useState } from 'react'

type Phase = 'night' | 'lit' | 'zoom' | 'open' | 'fade' | 'gone'

/* Façade réelle (photo 1672 × 941). Repères mesurés sur la photo :
   - lambrequin du store : y 268 → 334, traits blancs à y ≈ 300 (remplacés par le texte)
   - portes : vantail gauche x 700 → 851, vantail droit x 851 → 1001, y 350 → 696 */
const W = 1672, H = 941
const SRC = '/assets/photos/facade.webp'
const DOOR = { x: 700, y: 350, w: 301, h: 346 }
const MID = 851

export function Entrance({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>('night')
  const cam = useRef<HTMLDivElement>(null)
  const door = useRef<SVGRectElement>(null)
  const timers = useRef<number[]>([])
  const doneRef = useRef(false)
  const t = (ms: number, f: () => void) => { timers.current.push(window.setTimeout(f, ms)) }

  const finish = () => {
    if (doneRef.current) return
    doneRef.current = true
    setPhase('gone')
    document.body.classList.remove('locked') // le scroll est rendu dès la fin de l'entrée
    window.setTimeout(onDone, 700) // laisse le fondu se terminer avant de retirer l'écran
  }

  const enter = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    const c = cam.current, d = door.current
    if (c && d) {
      const cr = c.getBoundingClientRect(), dr = d.getBoundingClientRect()
      const ox = ((dr.left + dr.width / 2 - cr.left) / cr.width) * 100
      const oy = ((dr.top + dr.height / 2 - cr.top) / cr.height) * 100
      c.style.transformOrigin = `${ox}% ${oy}%`
      const scale = Math.min(cr.width / dr.width, cr.height / dr.height) * 0.92
      requestAnimationFrame(() => { c.style.transform = `scale(${Math.max(scale, 1.6)})` })
    }
    setPhase('zoom')
    t(1200, () => setPhase('open'))
    t(3000, () => setPhase('fade'))
    t(3700, finish)
  }

  useEffect(() => {
    document.body.classList.add('locked')
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { t(300, finish); return () => timers.current.forEach(clearTimeout) }
    t(500, () => setPhase('lit'))
    t(2600, enter)
    return () => { timers.current.forEach(clearTimeout); document.body.classList.remove('locked') }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const has = (...p: Phase[]) => p.includes(phase)
  const cls = ['entrance2',
    !has('night') && 'is-lit',
    has('zoom', 'open', 'fade', 'gone') && 'is-zoom',
    has('open', 'fade', 'gone') && 'is-open',
    has('fade', 'gone') && 'is-fade',
    has('gone') && 'is-gone'].filter(Boolean).join(' ')

  return (
    <div className={cls} role="dialog" aria-label="Entrée du restaurant">
      <div className="entrance2__cam" ref={cam}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <clipPath id="cFlap"><rect x="0" y="266" width={W} height="70" /></clipPath>
            <clipPath id="cDoorL"><rect x={DOOR.x} y={DOOR.y} width={MID - DOOR.x} height={DOOR.h} /></clipPath>
            <clipPath id="cDoorR"><rect x={MID} y={DOOR.y} width={DOOR.x + DOOR.w - MID} height={DOOR.h} /></clipPath>
            <clipPath id="cOpening"><rect x={DOOR.x + 6} y={DOOR.y + 6} width={DOOR.w - 12} height={DOOR.h - 6} /></clipPath>
            <linearGradient id="gHinge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".55" /></linearGradient>
          </defs>

          {/* la photo */}
          <image href={SRC} width={W} height={H} />

          {/* les lumières intérieures sont éteintes au départ, puis s'allument */}
          <g className="e2-night">
            <rect x="110" y="343" width="522" height="242" />
            <rect x="1068" y="343" width="494" height="236" />
            <rect x={DOOR.x} y={DOOR.y} width={DOOR.w} height={DOOR.h} />
          </g>

          {/* derrière les portes : la salle, vue plus en profondeur */}
          <g clipPath="url(#cOpening)" className="e2-inside">
            {/* grand carreau de la vitrine gauche (x 380 → 628, y 345 → 580), sans montant ni poignée, recadré dans l'ouverture */}
            <image href={SRC} width={W} height={H} transform="translate(851 526) scale(1.55) translate(-505 -462)" />
          </g>

          {/* les deux vantaux, qui pivotent sur leurs gonds */}
          <g className="e2-leaf e2-leaf--l">
            <image href={SRC} width={W} height={H} clipPath="url(#cDoorL)" />
            <rect className="e2-shade" x={DOOR.x} y={DOOR.y} width={MID - DOOR.x} height={DOOR.h} fill="url(#gHinge)" />
          </g>
          <g className="e2-leaf e2-leaf--r">
            <image href={SRC} width={W} height={H} clipPath="url(#cDoorR)" />
            <rect className="e2-shade" x={MID} y={DOOR.y} width={DOOR.x + DOOR.w - MID} height={DOOR.h} fill="url(#gHinge)" transform={`rotate(180 ${(MID + DOOR.x + DOOR.w) / 2} ${DOOR.y + DOOR.h / 2})`} />
          </g>
          <rect ref={door} x={DOOR.x} y={DOOR.y} width={DOOR.w} height={DOOR.h} fill="none" />

          {/* le lambrequin du store, avec le texte, qui ondule à peine */}
          <g className="e2-flap">
            <image href={SRC} width={W} height={H} clipPath="url(#cFlap)" />
            <g fill="#2c2926">
              <rect x="186" y="294" width="214" height="14" /><rect x="760" y="294" width="182" height="14" /><rect x="1320" y="294" width="190" height="14" />
            </g>
            <g fill="#f4efe6">
              <text x="292" y="307" fontFamily="Montserrat, sans-serif" fontWeight="600" fontSize="17" letterSpacing="5" textAnchor="middle">CUISINE DU MONDE</text>
              <text x="851" y="313" fontFamily="Yesteryear, cursive" fontSize="38" textAnchor="middle">Les Lumières</text>
              <text x="1415" y="307" fontFamily="Montserrat, sans-serif" fontWeight="600" fontSize="17" letterSpacing="5" textAnchor="middle">CAFÉ LITTÉRAIRE</text>
            </g>
          </g>
        </svg>
      </div>
      <div className="entrance2__veil" />
      <div className="entrance2__ui">
        <span className="entrance2__hint">31-33 avenue Ampère · Champs-sur-Marne</span>
        <button type="button" className="entrance2__btn" onClick={enter}>Entrer</button>
      </div>
    </div>
  )
}
