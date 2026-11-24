import { useEffect, useRef, useState } from 'react'

type Phase = 'night' | 'lit' | 'walk' | 'open' | 'through' | 'gone'

/* Façade réelle (photo 1672 × 941). Repères mesurés sur la photo :
   lambrequin du store y 266 → 336 (traits blancs à y ≈ 300), portes x 700 → 1001 / y 350 → 696 (milieu x 851),
   carreau sans montant de la vitrine gauche x 380 → 628 / y 345 → 580. */
const IW = 1672, IH = 941
const SRC = '/assets/photos/facade.webp'

/** Place un élément sur la photo (coordonnées en pixels de la photo) et lui donne le bon morceau de photo en fond. */
function crop(x: number, y: number, w: number, h: number, src?: { x: number; y: number; w: number; h: number }, pw = IW, ph = IH): React.CSSProperties {
  const s = src ?? { x, y, w, h }
  return {
    left: `${(x / pw) * 100}%`, top: `${(y / ph) * 100}%`, width: `${(w / pw) * 100}%`, height: `${(h / ph) * 100}%`,
    backgroundImage: `url(${SRC})`,
    backgroundSize: `${(IW / s.w) * 100}% ${(IH / s.h) * 100}%`,
    // position en % : x / (largeur photo − largeur du morceau) ; 0 quand le morceau fait toute la largeur
    backgroundPosition: `${IW === s.w ? 0 : (s.x / (IW - s.w)) * 100}% ${IH === s.h ? 0 : (s.y / (IH - s.h)) * 100}%`,
  }
}
const box = (x: number, y: number, w: number, h: number, pw = IW, ph = IH): React.CSSProperties =>
  ({ left: `${(x / pw) * 100}%`, top: `${(y / ph) * 100}%`, width: `${(w / pw) * 100}%`, height: `${(h / ph) * 100}%` })

export function Entrance({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>('night')
  const timers = useRef<number[]>([])
  const doneRef = useRef(false)
  const t = (ms: number, f: () => void) => { timers.current.push(window.setTimeout(f, ms)) }

  const finish = () => {
    if (doneRef.current) return
    doneRef.current = true
    setPhase('gone')
    document.body.classList.remove('locked')
    window.setTimeout(onDone, 700)
  }
  const enter = () => {
    if (doneRef.current) return
    timers.current.forEach(clearTimeout); timers.current = []
    setPhase('walk')
    t(900, () => setPhase('open'))
    t(2700, () => setPhase('through'))
    t(3500, finish)
  }

  useEffect(() => {
    document.body.classList.add('locked')
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { t(300, finish); return () => timers.current.forEach(clearTimeout) }
    t(400, () => setPhase('lit'))
    t(2600, enter)
    return () => { timers.current.forEach(clearTimeout); document.body.classList.remove('locked') }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // la porte et le store ont leurs propres repères internes (en pixels de la photo)
  const DW = 301, DH = 346
  return (
    <div className={`e3 is-${phase}`} role="dialog" aria-label="Entrée du restaurant">
      <div className="e3-stage">
        <div className="e3-photo" />

        {/* les lumières intérieures s'allument */}
        <span className="e3-night" style={box(110, 343, 522, 242)} />
        <span className="e3-night e3-night--2" style={box(1068, 343, 494, 236)} />

        {/* l'embrasure de la porte : la salle derrière, puis les deux vantaux qui pivotent sur leurs gonds */}
        <div className="e3-doorway" style={box(700, 350, DW, DH)}>
          <span className="e3-inside" style={crop(6, 6, DW - 12, DH - 6, { x: 380, y: 345, w: 248, h: 235 }, DW, DH)} />
          <span className="e3-night e3-night--door" />
          <span className="e3-leaf e3-leaf--l" style={crop(0, 0, 151, DH, { x: 700, y: 350, w: 151, h: DH }, DW, DH)}><i /></span>
          <span className="e3-leaf e3-leaf--r" style={crop(151, 0, 150, DH, { x: 851, y: 350, w: 150, h: DH }, DW, DH)}><i /></span>
        </div>

        {/* le lambrequin du store, avec le texte, qui ondule à peine */}
        <div className="e3-flap" style={crop(0, 266, IW, 70)}>
          <span className="e3-patch" style={box(186, 28, 214, 14, IW, 70)} />
          <span className="e3-patch" style={box(760, 28, 182, 14, IW, 70)} />
          <span className="e3-patch" style={box(1320, 28, 190, 14, IW, 70)} />
          <span className="e3-txt e3-txt--side" style={{ left: `${(292 / IW) * 100}%` }}>CUISINE DU MONDE</span>
          <span className="e3-txt e3-txt--name" style={{ left: `${(851 / IW) * 100}%` }}>Les Lumières</span>
          <span className="e3-txt e3-txt--side" style={{ left: `${(1415 / IW) * 100}%` }}>CAFÉ LITTÉRAIRE</span>
        </div>
      </div>

      <div className="e3-veil" />
      <div className="e3-ui">
        <span className="e3-hint">31-33 avenue Ampère · Champs-sur-Marne</span>
        <button type="button" className="e3-btn" onClick={enter}>Entrer</button>
      </div>
    </div>
  )
}
