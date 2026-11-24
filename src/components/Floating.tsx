import { useEffect, useState } from 'react'
import { Copy, Mail, MapPin, MessageCircle, Phone, X } from 'lucide-react'
import { useDraggable } from '@/hooks/useDraggable'
import { LOGO, store } from '@/lib/menu'
import { CONTACT } from '@/lib/contact'

/** Le logo Les Lumières sert de panier : lumineux, déplaçable, s'illumine en or à chaque ajout. */
export function CartLamp({ count, flash, onOpen }: { count: number; flash: number; onOpen: () => void }) {
  const size = typeof window !== 'undefined' && innerWidth < 640 ? 62 : 70
  const d = useDraggable('lamp', size, 'top-right')
  const [lit, setLit] = useState(false)
  const [tip, setTip] = useState(() => !store.get('lampTip', false))

  useEffect(() => {
    if (!flash) return
    setLit(false)
    const r = requestAnimationFrame(() => setLit(true))
    const t = setTimeout(() => setLit(false), 1400)
    return () => { cancelAnimationFrame(r); clearTimeout(t) }
  }, [flash])

  useEffect(() => {
    if (!tip || count === 0) return
    const t = setTimeout(() => { setTip(false); store.set('lampTip', true) }, 4500)
    return () => clearTimeout(t)
  }, [tip, count])

  return (
    <button
      ref={d.ref as React.RefObject<HTMLButtonElement>}
      type="button"
      className={`lamp${count ? ' has-items' : ''}${lit ? ' is-flash' : ''}`}
      style={d.style}
      aria-label={`Mon panier, ${count} article${count > 1 ? 's' : ''}`}
      onPointerDown={d.onPointerDown}
      onPointerMove={d.onPointerMove}
      onPointerUp={e => { if (d.onPointerUp(e)) onOpen() }}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen() } }}
    >
      <img src={LOGO} alt="" width={56} height={56} />
      {count > 0 && <span className="lamp__count">{count}</span>}
      {tip && count > 0 && <span className={`lamp__tip${d.onLeftHalf ? ' left' : ''}`}>Votre panier · déplacez-moi</span>}
    </button>
  )
}

/** Petite bulle de contact, en bas à droite, déplaçable, qui se déplie en tout petit. */
export function ContactBubble({ toast }: { toast: (m: string) => void }) {
  const d = useDraggable('contact', 54, 'bottom-right')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    addEventListener('keydown', close)
    return () => removeEventListener('keydown', close)
  }, [open])

  const copy = (v: string) => {
    const done = () => toast('Copié : ' + v)
    if (navigator.clipboard) navigator.clipboard.writeText(v).then(done, () => toast(v))
    else toast(v)
  }

  return (
    <div ref={d.ref as React.RefObject<HTMLDivElement>} className="contact" style={d.style}>
      {open && (
        <div className={`contact__pop ${d.onLeftHalf ? 'is-left' : ''} ${d.onTopHalf ? 'is-below' : ''}`} role="dialog" aria-label="Nous contacter">
          <p className="contact__t">Une question ?</p>
          <a className="contact__row" href={CONTACT.phoneHref}>
            <Phone size={15} /><span><b>Appeler</b><small className="mono">{CONTACT.phone}</small></span>
            <span className="contact__copy" role="button" tabIndex={0} aria-label="Copier le numéro" onClick={e => { e.preventDefault(); copy(CONTACT.phone) }}><Copy size={13} /></span>
          </a>
          {CONTACT.whatsapp
            ? <a className="contact__row" href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener"><MessageCircle size={15} /><span><b>WhatsApp</b><small>Écrivez-nous</small></span></a>
            : <div className="contact__row is-off"><MessageCircle size={15} /><span><b>WhatsApp</b><small>À renseigner</small></span></div>}
          {CONTACT.email
            ? <a className="contact__row" href={`mailto:${CONTACT.email}`}><Mail size={15} /><span><b>E-mail</b><small>{CONTACT.email}</small></span></a>
            : <div className="contact__row is-off"><Mail size={15} /><span><b>E-mail</b><small>À renseigner</small></span></div>}
          <a className="contact__row" href={CONTACT.maps} target="_blank" rel="noopener"><MapPin size={15} /><span><b>Itinéraire</b><small>{CONTACT.address}</small></span></a>
        </div>
      )}
      <button
        type="button"
        className={`contact__btn${open ? ' is-open' : ''}`}
        aria-label={open ? 'Fermer les contacts' : 'Nous contacter'}
        aria-expanded={open}
        onPointerDown={d.onPointerDown}
        onPointerMove={d.onPointerMove}
        onPointerUp={e => { if (d.onPointerUp(e)) setOpen(o => !o) }}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o) } }}
      >
        {open ? <X size={20} /> : <MessageCircle size={21} />}
      </button>
    </div>
  )
}
