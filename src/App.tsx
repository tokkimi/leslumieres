import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowDown, MapPin, Phone, User } from 'lucide-react'
import { FloatingFoodHero } from '@/components/ui/hero-section-7'
import { Entrance } from '@/components/Entrance'
import { CartLamp, ContactBubble } from '@/components/Floating'
import { Account, CartDrawer, ModeSwitch, ProductSheet } from '@/components/Overlays'
import { Caisse } from '@/components/Caisse'
import { BarScene, BorneScene, KioskOverlay, VitrineScene } from '@/components/Scenes'
import { LOGO, img, lower, store, type Chosen, type Line, type Mode, type ProductRef } from '@/lib/menu'
import { CONTACT } from '@/lib/contact'
import { PayLogos } from '@/components/PayLogos'

const heroImages = [
  { src: img('159920'), alt: 'Burrata', className: 'w-32 sm:w-52 md:w-60 lg:w-72 top-[9%] left-[-8%] sm:left-[4%] md:top-[11%] md:left-[7%] animate-float' },
  { src: img('159946'), alt: 'Brochettes de poulet satay', className: 'w-28 sm:w-44 md:w-56 bottom-[19%] right-[-8%] sm:bottom-auto sm:top-[10%] sm:right-[6%] md:top-[11%] md:right-[9%] animate-float' },
  { src: img('1640752'), alt: 'Curry vert aux crevettes', className: 'hidden sm:block w-36 md:w-48 bottom-[10%] right-[10%] md:bottom-[12%] md:right-[14%] animate-float' },
  { src: img('159921'), alt: 'Carpaccio de bœuf', className: 'w-24 sm:w-36 md:w-44 bottom-[18%] left-[-7%] sm:bottom-[9%] sm:left-[9%] md:bottom-[12%] md:left-[13%] animate-float' },
  { src: img('1640754'), alt: 'Bœuf basilic thaï', className: 'hidden md:block w-40 lg:w-52 top-1/2 -translate-y-1/2 right-[1%] animate-float' },
  { src: img('1584512'), alt: 'Nems au poulet', className: 'hidden md:block w-32 lg:w-44 top-1/2 left-[1%] animate-float' },
]

let toastTimer = 0

export default function App() {
  const [entered, setEntered] = useState(false)
  const [mode, setModeState] = useState<Mode>(() => store.get('mode', 'emporter'))
  const [cart, setCart] = useState<Line[]>(() => store.get('cart', []))
  const [flash, setFlash] = useState(0)
  const [product, setProduct] = useState<ProductRef | null>(null)
  const [kiosk, setKiosk] = useState<{ start?: string } | null>(null)
  const [panel, setPanel] = useState<null | 'cart' | 'caisse'>(null)
  const [account, setAccount] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const setMode = (m: Mode) => { setModeState(m); store.set('mode', m) }
  useEffect(() => { store.set('cart', cart) }, [cart])
  const toast = useCallback((m: string) => { setToastMsg(m); clearTimeout(toastTimer); toastTimer = window.setTimeout(() => setToastMsg(''), 2400) }, [])

  const count = cart.reduce((s, l) => s + l.qty, 0)
  const total = cart.reduce((s, l) => s + l.unit * l.qty, 0)
  const cartQty = useMemo(() => cart.reduce<Record<string, number>>((m, l) => { m[l.id] = (m[l.id] ?? 0) + l.qty; return m }, {}), [cart])

  /* Le plat vole jusqu'au logo-panier, qui s'illumine en or */
  const fly = (from: HTMLElement | null, src: string) => {
    const lamp = document.querySelector('.lamp')
    if (!from || !lamp || matchMedia('(prefers-reduced-motion: reduce)').matches) { setFlash(Date.now()); return }
    const a = from.getBoundingClientRect(), b = lamp.getBoundingClientRect()
    const el = document.createElement('img')
    el.src = src; el.className = 'flyer'
    Object.assign(el.style, { left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px' })
    document.body.appendChild(el)
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2)
    el.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * .55}px, ${dy * .3 - 80}px) scale(.6)`, opacity: 1, offset: .5 },
      { transform: `translate(${dx}px, ${dy}px) scale(.12)`, opacity: .2 },
    ], { duration: 750, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = () => { el.remove(); setFlash(Date.now()) }
  }

  const addToCart = (p: ProductRef, opts: Chosen[], note: string, qty: number, from: HTMLElement | null) => {
    const key = p.id + '|' + opts.map(o => o.n).join(',') + '|' + note
    const unit = p.p + opts.reduce((s, o) => s + o.p, 0)
    setCart(c => {
      const i = c.findIndex(l => l.key === key)
      if (i >= 0) return c.map((l, k) => k === i ? { ...l, qty: l.qty + qty } : l)
      return [...c, { key, id: p.id, n: p.n, sec: p.sec.t, opts, note, unit, qty }]
    })
    fly(from, img(p.id))
    toast(`${qty} × ${lower(p.n)} ajouté`)
  }
  /* Produit sans option : ajout direct. Sinon : fiche de composition. */
  const pick = (p: ProductRef, from: HTMLElement | null) => {
    if (p.o?.length) setProduct(p)
    else addToCart(p, [], '', 1, from)
  }
  const changeQty = (i: number, d: number) => setCart(c => c.flatMap((l, k) => k !== i ? [l] : l.qty + d <= 0 ? [] : [{ ...l, qty: l.qty + d }]))

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const startExperience = () => go('borne')

  return (
    <>
      {!entered && <Entrance onDone={() => setEntered(true)} />}

      <header className="topbar">
        <div className="topbar__in">
          <a href="#accueil" className="topbar__brand"><img src={LOGO} alt="" /><span>Les Lumières</span></a>
          <nav className="topbar__nav" aria-label="La salle">
            <a href="#borne">La borne</a><a href="#vitrine">La vitrine</a><a href="#bar">Le bar</a><a href="#infos">Infos</a>
          </nav>
          <button type="button" className="topbar__user" aria-label="Mon compte" onClick={() => setAccount(true)}><User size={18} strokeWidth={1.6} /></button>
        </div>
      </header>

      <main id="accueil">
        <div className="relative screen screen--hero">
          <FloatingFoodHero
            className="hero-ll min-h-[100svh] lg:min-h-[100svh]"
            swirlClassName="text-[rgba(240,189,110,.18)]"
            title="Les Lumières"
            description="Cuisine du monde faite maison, entre Asie et Europe. Burgers, wok thaï, currys, pâtes et grillades, à emporter ou sur place."
            images={heroImages}
          >
            <p className="script text-[var(--ambre)] text-3xl mt-3 mb-0" style={{ textShadow: '0 0 18px rgba(240,189,110,.45)' }}>depuis 2020</p>
            <div className="mx-auto mt-7 w-[min(340px,100%)]"><ModeSwitch mode={mode} setMode={setMode} /></div>
          </FloatingFoodHero>
          <div className="absolute inset-x-0 bottom-[calc(24px+env(safe-area-inset-bottom,0px))] z-30 flex justify-center">
            <button type="button" className="cta-order" onClick={startExperience}>
              <span className="cta-order__pill">Commander</span>
              <ArrowDown className="cta-order__arrow" size={22} />
            </button>
          </div>
        </div>

        <BorneScene openKiosk={cat => setKiosk({ start: cat })} next={() => go('vitrine')} />
        <VitrineScene onPick={pick} cartQty={cartQty} next={() => go('bar')} />
        <BarScene onPick={pick} cartQty={cartQty} count={count} onFinish={() => setPanel(count ? 'caisse' : 'cart')} />

        <section id="infos" className="scene screen wall-facade gutter">
          <div className="max-w-[1100px] mx-auto grid md:grid-cols-3 gap-5">
            <div className="neu p-7 md:col-span-1 grid gap-3 content-start">
              <h2 className="m-0 text-3xl font-black uppercase tracking-[.06em]">Nous trouver</h2>
              <p className="m-0 text-lg font-semibold flex gap-2"><MapPin size={18} className="mt-1 text-[var(--ambre)] flex-none" />31-33 avenue Ampère<br />77420 Champs-sur-Marne</p>
              <a href={CONTACT.phoneHref} className="m-0 text-lg flex gap-2 items-center no-underline text-[var(--blanc)]"><Phone size={17} className="text-[var(--ambre)]" /><span className="mono select-all">{CONTACT.phone}</span></a>
              <a className="btn btn--light mt-2 justify-self-start" href={CONTACT.maps} target="_blank" rel="noopener">Itinéraire</a>
            </div>
            <div className="neu p-7 grid gap-3 content-start infos-cmd">
              <h3 className="m-0 text-sm font-extrabold uppercase tracking-[.16em]">Commander</h3>
              <p className="m-0 text-[#cfc7bb]"><b className="text-[var(--blanc)]">En ligne</b>, à emporter ou sur place</p>
              <p className="m-0 text-[#cfc7bb]"><b className="text-[var(--blanc)]">En salle</b>, sur nos bornes</p>
              <p className="m-0 text-[#cfc7bb]"><b className="text-[var(--blanc)]">Par téléphone</b> au {CONTACT.phone}</p>
            </div>
            <div className="neu p-7 grid gap-3 content-start">
              <h3 className="m-0 text-sm font-extrabold uppercase tracking-[.16em]">Paiements acceptés</h3>
              <PayLogos />
            </div>
          </div>
        <footer className="infos-foot">
        <img src={LOGO} alt="Les Lumières" className="w-20 opacity-85" />
        <p className="m-0">Les Lumières © 2026 · Tous droits réservés</p>
        <p className="m-0 mono text-[11px] text-[#6f675d]">Maquette de démonstration · aucune commande n’est réellement transmise</p>
      </footer>
        </section>
      </main>



      <CartLamp count={count} flash={flash} onOpen={() => setPanel('cart')} />
      <ContactBubble toast={toast} />

      {kiosk && <KioskOverlay start={kiosk.start} mode={mode} setMode={setMode} total={total} count={count} cartQty={cartQty} onClose={() => setKiosk(null)} onPick={pick} onCart={() => { setKiosk(null); setPanel('cart') }} />}
      {product && <ProductSheet p={product} toast={toast} onClose={() => setProduct(null)} onAdd={(o, n, q, from) => { addToCart(product, o, n, q, from); setProduct(null) }} />}
      {panel === 'cart' && <CartDrawer cart={cart} mode={mode} setMode={setMode} onQty={changeQty} onClose={() => setPanel(null)} onCheckout={() => setPanel('caisse')} />}
      {panel === 'caisse' && <Caisse cart={cart} mode={mode} setMode={setMode} onClose={() => setPanel(null)} onPaid={() => setCart([])} onLogin={() => setAccount(true)} />}
      {account && <Account toast={toast} onClose={() => setAccount(false)} />}

      <div className={`toast${toastMsg ? ' is-on' : ''}`} role="status" aria-live="polite">{toastMsg}</div>
    </>
  )
}
