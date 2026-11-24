import { useCallback, useEffect, useRef, useState } from 'react'
import { store } from '@/lib/menu'

type Corner = 'top-right' | 'bottom-right'
const MARGIN = 16

/**
 * Bouton flottant déplaçable (souris et tactile), aimanté au bord droit :
 * on peut le déplacer, et au relâchement il revient se coller à droite (seule la hauteur est gardée).
 * Un appui sans déplacement = clic.
 */
export function useDraggable(key: string, size: number, corner: Corner) {
  const defaultY = () => (corner === 'top-right' ? 72 : window.innerHeight - size - MARGIN - 8)
  const rightX = useCallback(() => window.innerWidth - size - MARGIN, [size])
  const clampY = useCallback((y: number) => Math.min(Math.max(MARGIN, y), window.innerHeight - size - MARGIN), [size])
  const storeKey = 'dock_' + key // nouvelle clé : on oublie les anciennes positions libres
  const [y, setY] = useState<number>(() => clampY(store.get<number | null>(storeKey, null) ?? defaultY()))
  const [snapping, setSnapping] = useState(false)
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null)
  const el = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const onResize = () => setY(v => clampY(v))
    addEventListener('resize', onResize)
    return () => removeEventListener('resize', onResize)
  }, [clampY])

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    drag.current = { sx: e.clientX, sy: e.clientY, ox: rightX(), oy: y, moved: false }
    setSnapping(false)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy
    if (!d.moved && Math.hypot(dx, dy) < 6) return
    d.moved = true
    const nx = Math.min(Math.max(MARGIN, d.ox + dx), window.innerWidth - size - MARGIN)
    if (el.current) el.current.style.transform = `translate3d(${nx}px, ${clampY(d.oy + dy)}px, 0)`
  }
  /** Renvoie true si c'était un vrai clic (pas un déplacement). */
  const onPointerUp = (e: React.PointerEvent): boolean => {
    const d = drag.current
    drag.current = null
    if (!d) return false
    if (!d.moved) return true
    const ny = clampY(d.oy + e.clientY - d.sy)
    setSnapping(true) // retour en douceur sur le bord droit
    setY(ny)
    store.set(storeKey, ny)
    if (el.current) el.current.style.transform = `translate3d(${rightX()}px, ${ny}px, 0)`
    return false
  }

  const style: React.CSSProperties = {
    left: 0, top: 0, transform: `translate3d(${rightX()}px, ${y}px, 0)`,
    transition: snapping ? 'transform .45s cubic-bezier(.2, .8, .2, 1)' : undefined,
  }
  const onTopHalf = y < window.innerHeight / 2
  return { ref: el, style, onPointerDown, onPointerMove, onPointerUp, onLeftHalf: false, onTopHalf }
}
