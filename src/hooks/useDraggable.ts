import { useCallback, useEffect, useRef, useState } from 'react'
import { store } from '@/lib/menu'

type Pos = { x: number; y: number }
type Corner = 'top-right' | 'bottom-right'

/**
 * Bouton flottant déplaçable (souris et tactile). Un appui sans déplacement = clic.
 * La position est mémorisée et ramenée dans l'écran au redimensionnement.
 */
export function useDraggable(key: string, size: number, corner: Corner) {
  const initial = (): Pos => {
    const w = window.innerWidth, h = window.innerHeight, m = 16
    return corner === 'top-right' ? { x: w - size - m, y: 78 } : { x: w - size - m, y: h - size - m - 8 }
  }
  const [pos, setPos] = useState<Pos>(() => store.get<Pos | null>('pos_' + key, null) ?? initial())
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null)
  const el = useRef<HTMLElement | null>(null)

  const clamp = useCallback((p: Pos): Pos => {
    const m = 8
    return {
      x: Math.min(Math.max(m, p.x), window.innerWidth - size - m),
      y: Math.min(Math.max(m, p.y), window.innerHeight - size - m),
    }
  }, [size])

  useEffect(() => {
    const onResize = () => setPos(p => clamp(p))
    onResize()
    addEventListener('resize', onResize)
    return () => removeEventListener('resize', onResize)
  }, [clamp])

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y, moved: false }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy
    if (!d.moved && Math.hypot(dx, dy) < 6) return
    d.moved = true
    // déplacement direct sur le DOM : pas de rendu React à chaque frame (fluide sur mobile)
    const p = clamp({ x: d.ox + dx, y: d.oy + dy })
    if (el.current) el.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`
  }
  /** Renvoie true si c'était un vrai clic (pas un déplacement). */
  const onPointerUp = (e: React.PointerEvent): boolean => {
    const d = drag.current
    drag.current = null
    if (!d) return false
    if (!d.moved) return true
    const p = clamp({ x: d.ox + e.clientX - d.sx, y: d.oy + e.clientY - d.sy })
    setPos(p)
    store.set('pos_' + key, p)
    return false
  }

  const style: React.CSSProperties = { left: 0, top: 0, transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }
  const onLeftHalf = pos.x < window.innerWidth / 2
  const onTopHalf = pos.y < window.innerHeight / 2
  return { ref: el, style, onPointerDown, onPointerMove, onPointerUp, onLeftHalf, onTopHalf }
}
