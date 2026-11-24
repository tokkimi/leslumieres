import { useCallback, useEffect, useRef, useState } from 'react'

/** Rangée défilante horizontale avec de fines flèches dorées de chaque côté, visibles seulement s'il reste du contenu. */
export function Scroller({ className, children, onScroll, label }: { className: string; children: React.ReactNode; onScroll?: (el: HTMLDivElement) => void; label?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [edge, setEdge] = useState({ left: false, right: false })
  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    setEdge({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 })
    onScroll?.(el)
  }, [onScroll])
  useEffect(() => {
    update()
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [update, children])
  const go = (dir: number) => { const el = ref.current; if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' }) }
  return (
    <div className="scroller">
      <div ref={ref} className={className} onScroll={update} aria-label={label}>{children}</div>
      <button type="button" className={`chev chev--l${edge.left ? ' is-on' : ''}`} onClick={() => go(-1)} aria-label="Voir les précédents" tabIndex={edge.left ? 0 : -1}>
        <svg viewBox="0 0 12 24" aria-hidden="true"><path d="M10 2 2 12l8 10" /></svg>
      </button>
      <button type="button" className={`chev chev--r${edge.right ? ' is-on' : ''}`} onClick={() => go(1)} aria-label="Voir les suivants" tabIndex={edge.right ? 0 : -1}>
        <svg viewBox="0 0 12 24" aria-hidden="true"><path d="M2 2l8 10-8 10" /></svg>
      </button>
    </div>
  )
}
