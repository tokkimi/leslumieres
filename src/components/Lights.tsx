/* Les lumières de la salle, d'après les photos :
   bandeau LED chaud au plafond, guirlande d'ampoules à filament sur la brique,
   suspensions « bocaux » en verre clair, trois boules blanches, cadre néon doré.
   Les halos sont de simples dégradés (pas de flou), seule l'opacité est animée : fluide sur mobile. */

/** Rangée d'ampoules à filament suspendues à un câble, chacune avec son halo sur le mur. */
export function Guirlande({ count = 18, top = 96, className = '' }: { count?: number; top?: number; className?: string }) {
  return (
    <div className={`guirlande ${className}`} style={{ top }} aria-hidden="true">
      <span className="guirlande__cable" />
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="edison"
          style={{
            left: `${((i + .5) / count) * 100}%`,
            ['--drop' as string]: `${8 + ((i * 7) % 5) * 3}px`,
            animationDelay: `${-(i * 0.73) % 5}s`,
          }}
        ><i /></span>
      ))}
    </div>
  )
}

/** Suspensions en verre transparent (« bocaux ») avec filament visible. */
export function Bocaux({ items }: { items: { x: string; drop: number; size?: number; hideSm?: boolean }[] }) {
  return (
    <>
      {items.map((b, i) => (
        <span key={i} className={`bocal${b.hideSm ? ' hide-sm' : ''}`} style={{ left: b.x, ['--drop' as string]: `${b.drop}px`, ['--s' as string]: `${b.size ?? 1}`, animationDelay: `${-i * 1.3}s` }} aria-hidden="true">
          <i className="bocal__verre"><b /></i>
        </span>
      ))}
    </>
  )
}

/** Les trois boules blanches qui descendent du plafond. */
export function Boules({ drops = [70, 30, 95] }: { drops?: number[] }) {
  return (
    <div className="boules" aria-hidden="true">
      {drops.map((d, i) => <span key={i} className="boule" style={{ ['--drop' as string]: `${d}px` }}><i /></span>)}
    </div>
  )
}

/** Cadre néon doré accroché sur la brique (avec le logo). */
export function CadreNeon({ src, className = '' }: { src: string; className?: string }) {
  return (
    <div className={`neon-frame ${className}`} aria-hidden="true">
      <img src={src} alt="" />
    </div>
  )
}

/** Bandeau LED du plafond, avec la lumière qui coule sur le haut du mur. */
export function Plafond() {
  return <div className="ceiling" aria-hidden="true"><span className="ceiling__wash" /></div>
}
