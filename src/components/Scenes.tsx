import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, ChevronRight, Plus, X } from 'lucide-react'
import { CATS, GROUPS, LOGO, catById, catImg, countCat, eur, img, type Category, type Mode, type ProductRef, PRODUCTS } from '@/lib/menu'
import { Modal, ModeSwitch } from '@/components/Overlays'

type Pick = (p: ProductRef, from: HTMLElement | null) => void

function StringLights({ n = 24 }: { n?: number }) {
  return (
    <svg className="string-lights" viewBox="0 0 1200 80" preserveAspectRatio="none" aria-hidden="true">
      {[0, 1].map(k => {
        const x0 = k * 600, x1 = x0 + 600
        return (
          <g key={k}>
            <path d={`M${x0} 4 Q ${x0 + 300} 70 ${x1} 4`} stroke="#140d08" strokeWidth="1.5" fill="none" />
            {Array.from({ length: n / 2 }, (_, i) => {
              const t = (i + .5) / (n / 2); const x = x0 + 600 * t; const y = 4 + 4 * 33 * t * (1 - t)
              return <circle key={i} cx={x} cy={y + 5} r="3.6" fill="#ffd590" style={{ filter: 'drop-shadow(0 0 6px #ffb347)' }} />
            })}
          </g>
        )
      })}
    </svg>
  )
}

const qtyOf = (cartQty: Record<string, number>, id: string) => cartQty[id] ? <span className="qty-badge">{cartQty[id]}</span> : null

/* ================= La borne ================= */
export function BorneScene({ openKiosk, next }: { openKiosk: (cat?: string) => void; next: () => void }) {
  const dishes = useMemo(() => ['159935', '159942', '159930', '1640752', '159947', '1641620', '170564', '159917'], [])
  const [i, setI] = useState(0)
  const [awake, setAwake] = useState(false)
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setAwake(e.isIntersecting), { threshold: .35 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (!awake) return
    const t = setInterval(() => setI(x => (x + 1) % dishes.length), 2400)
    return () => clearInterval(t)
  }, [awake, dishes.length])

  const boards: [string, string[]][] = [['Cuisine', ['entrees', 'salades', 'creations']], ['Asie', ['thai', 'indien']], ['Classiques', ['pates', 'brasserie']], ['Burgers', ['burgers', 'enfant', 'accompagnements']]]

  return (
    <section id="borne" ref={ref} className="scene wall-brick gutter pb-6">
      <div className="ceiling" /><StringLights />
      <div className="scene__head">
        <span className="scene__eyebrow">Étape 1 · La borne</span>
        <h2 className="scene__title">Commandez à la borne</h2>
        <p className="scene__lead">Comme en salle : touchez l’écran, composez vos plats (cuisson, accompagnement, sauces, sans tomate…) et retrouvez tout dans le panier lumineux.</p>
      </div>
      <div className="borne-stage">
        <div className="boards" aria-label="Écrans du menu">
          {boards.map(([t, ids]) => (
            <button key={t} type="button" className="board" onClick={() => openKiosk(ids[0])} aria-label={`Voir ${t}`}>
              <span className="board__t">{t}</span>
              {ids.flatMap(id => catById(id).sections.flatMap(s => s.items)).slice(0, 9).map(p => (
                <span key={p.id} className="board__item"><span>{p.n.toLowerCase()}</span><span>{p.p.toFixed(2).replace('.', ',')}</span></span>
              ))}
            </button>
          ))}
        </div>
        <div className="kiosks">
          <button type="button" className={`kiosk${awake ? ' is-awake' : ''}`} onClick={() => openKiosk()} aria-label="Ouvrir la borne de commande">
            <div className="kiosk__screen">
              <img src={LOGO} alt="" className="kiosk__logo" />
              <img key={i} src={img(dishes[i])} alt="" className="kiosk__dish" />
              <span className="kiosk__touch">Touchez pour commander</span>
            </div>
          </button>
          <button type="button" className="kiosk kiosk--2" onClick={() => openKiosk('burgers')} aria-label="Ouvrir la borne sur les burgers">
            <div className="kiosk__screen">
              <span className="kiosk__label">Choisissez</span>
              <div className="kiosk__mini">{CATS.slice(0, 8).map(c => <span key={c.id} style={{ backgroundImage: `url(${catImg(c.img)})` }} />)}</div>
              <span className="kiosk__label">{CATS.length} rubriques</span>
            </div>
          </button>
        </div>
      </div>
      <div className="next-step"><button type="button" onClick={next}>Ensuite, la vitrine des desserts <ArrowDown size={15} /></button></div>
      <div className="floor" />
    </section>
  )
}

/* ================= Borne plein écran ================= */
export function KioskOverlay({ start, mode, setMode, total, count, onClose, onPick, onCart, cartQty }: { start?: string; mode: Mode; setMode: (m: Mode) => void; total: number; count: number; onClose: () => void; onPick: Pick; onCart: () => void; cartQty: Record<string, number> }) {
  const [cat, setCat] = useState<Category>(() => catById(start ?? CATS[0].id))
  const main = useRef<HTMLDivElement>(null)
  useEffect(() => { main.current?.scrollTo({ top: 0 }) }, [cat])
  return (
    <Modal onClose={onClose} ovClass="kiosk-ov" className="kiosk-dev" label="Borne de commande">
      <div className="kiosk-ui">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-[var(--line)]">
          <img src={LOGO} alt="" className="w-10 h-10" />
          <span className="hidden sm:block font-extrabold text-xs tracking-[.28em] uppercase mr-auto">Les Lumières</span>
          <div className="w-[min(300px,58vw)] ml-auto sm:ml-0"><ModeSwitch mode={mode} setMode={setMode} /></div>
          <button type="button" className="close !static !m-0 flex-none" onClick={onClose} aria-label="Fermer la borne"><X size={18} /></button>
        </header>
        <div className="grid min-h-0 md:grid-cols-[220px_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] md:grid-rows-1">
          <nav className="kiosk-ui__nav" aria-label="Rubriques">
            {CATS.map(c => (
              <button key={c.id} type="button" className="kiosk-ui__cat" aria-current={c.id === cat.id} onClick={() => setCat(c)}>
                <img src={catImg(c.img)} alt="" loading="lazy" />{c.name}
              </button>
            ))}
          </nav>
          <div ref={main} className="overflow-y-auto p-4 md:p-6 overscroll-contain">
            <div className="flex items-baseline gap-4 flex-wrap mb-4">
              <h3 className="m-0 text-2xl md:text-3xl font-black uppercase tracking-[.08em]">{cat.name}</h3>
              {cat.tag && <span className="script text-[var(--ambre)] text-2xl">{cat.tag}</span>}
              <span className="mono text-xs text-[var(--muted)] ml-auto">{countCat(cat)} articles</span>
            </div>
            {cat.sections.map(s => (
              <div key={s.id} className="mb-6">
                {s.t && <h4 className="mono text-xs tracking-[.2em] uppercase text-[var(--muted)] my-3">{s.t}</h4>}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {s.items.map(p => {
                    const custom = p.o?.some(k => GROUPS[k].req) ? 'À composer' : p.o?.length ? 'Personnalisable' : ''
                    return (
                      <button key={p.id} type="button" className="kcard" onClick={e => onPick(PRODUCTS[p.id], e.currentTarget.querySelector('img'))}>
                        {qtyOf(cartQty, p.id)}
                        <div className="kcard__img"><img src={img(p.id)} alt="" loading="lazy" /></div>
                        <span className="mt-3 text-[12px] md:text-[13px] font-extrabold uppercase tracking-[.06em] leading-tight">{p.n}</span>
                        {p.d && <span className="hidden md:block mt-1 text-xs text-[var(--muted)] line-clamp-2">{p.d}</span>}
                        <span className="mt-auto pt-2 flex items-end justify-between gap-2">
                          <span><span className="mono block">{eur(p.p)}</span>{custom && <span className="mono block text-[10px] tracking-[.08em] uppercase text-[var(--ambre)]">{custom}</span>}</span>
                          <span className="w-8 h-8 rounded-full grid place-items-center bg-[var(--blanc)] text-[var(--noir)] flex-none"><Plus size={16} /></span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <footer className="flex items-center gap-3 px-4 py-3 border-t border-[var(--line)] pb-[calc(12px+env(safe-area-inset-bottom,0px))]">
          <span className="text-xs text-[var(--muted)]">{count} article{count > 1 ? 's' : ''}</span>
          <span className="mono text-lg mr-auto">{eur(total)}</span>
          <button type="button" className="btn btn--light !min-h-[46px]" onClick={onCart} disabled={!count}>Ma commande <ChevronRight size={16} /></button>
        </footer>
      </div>
    </Modal>
  )
}

/* ================= La vitrine des desserts ================= */
export function VitrineScene({ onPick, cartQty, next }: { onPick: Pick; cartQty: Record<string, number>; next: () => void }) {
  const items = catById('desserts').sections.flatMap(s => s.items)
  const shelves: [string, typeof items][] = [
    ['Tiramisus maison', items.filter(p => p.n.includes('TIRAMISU'))],
    ['Cheesecakes & tartelettes', items.filter(p => /CHEESECAKE|TARTELETTE/.test(p.n))],
    ['Gourmandises', items.filter(p => !/TIRAMISU|CHEESECAKE|TARTELETTE/.test(p.n))],
  ]
  return (
    <section id="vitrine" className="scene wall-brick gutter pb-6">
      <div className="ceiling" />
      <div className="scene__head">
        <span className="scene__eyebrow">Étape 2 · La vitrine</span>
        <h2 className="scene__title">Une douceur ?</h2>
        <p className="scene__lead">Nos desserts maison vous attendent derrière la vitre. Touchez celui qui vous fait envie, il file dans votre panier.</p>
      </div>
      <div className="vitrine">
        <div className="vt-top"><b>Les Lumières</b><small>Pâtisseries maison</small></div>
        <div className="vt-glass">
          {shelves.map(([t, list]) => (
            <div key={t} className="vt-shelf">
              <span className="vt-shelf__label">{t}</span>
              <div className="vt-row">
                {list.map(p => (
                  <button key={p.id} type="button" className="dessert" onClick={e => onPick(PRODUCTS[p.id], e.currentTarget.querySelector('img'))} aria-label={`Ajouter ${p.n.toLowerCase()}, ${eur(p.p)}`}>
                    {qtyOf(cartQty, p.id)}
                    <img src={img(p.id)} alt="" loading="lazy" />
                    <span className="slate"><span>{p.n.replace('TIRAMISU ', '')}</span><em>{eur(p.p)}</em></span>
                    <span className="add-badge"><Plus size={14} /></span>
                  </button>
                ))}
              </div>
              <div className="vt-plate" />
            </div>
          ))}
        </div>
        <div className="vt-base" />
      </div>
      <div className="next-step"><button type="button" onClick={next}>Ensuite, le bar <ArrowDown size={15} /></button></div>
      <div className="floor" />
    </section>
  )
}

/* ================= Le bar ================= */
export function BarScene({ onPick, cartQty, onFinish, count }: { onPick: Pick; cartQty: Record<string, number>; onFinish: () => void; count: number }) {
  const b = catById('boissons')
  const order = ['Cocktails sans alcool', 'Thés glacés', 'Boissons chaudes', 'Softs']
  const secs = order.map(t => b.sections.find(s => s.t === t)!).filter(Boolean)
  return (
    <section id="bar" className="scene wall-bar gutter pb-0">
      <div className="ceiling" />
      <div className="globes" aria-hidden="true"><span className="globe" /><span className="globe" /><span className="globe" /></div>
      <div className="scene__head" style={{ paddingTop: 260 }}>
        <span className="scene__eyebrow">Étape 3 · Le bar</span>
        <h2 className="scene__title">Et à boire ?</h2>
        <p className="scene__lead">Cocktails sans alcool, thés glacés maison, cafés et softs : servez-vous sur les étagères.</p>
      </div>
      <div className="backbar">
        {secs.map(s => (
          <div key={s.id} className="shelf">
            <span className="shelf__plaque">{s.t}</span>
            <div className="shelf__row">
              {s.items.map(p => (
                <button key={p.id} type="button" className="drink" onClick={e => onPick(PRODUCTS[p.id], e.currentTarget.querySelector('img'))} aria-label={`Ajouter ${p.n.toLowerCase()}, ${eur(p.p)}`}>
                  {qtyOf(cartQty, p.id)}
                  <img src={img(p.id)} alt="" loading="lazy" />
                  <span className="slate"><span>{p.n}</span><em>{eur(p.p)}</em></span>
                  <span className="add-badge"><Plus size={14} /></span>
                </button>
              ))}
            </div>
            <div className="shelf__plank" />
          </div>
        ))}
      </div>
      <div className="counter">
        <div className="counter__top" />
        <div className="counter__front gutter">
          <button type="button" className="btn btn--light" onClick={onFinish}>{count ? 'Finaliser ma commande' : 'Voir mon panier'} <ChevronRight size={16} /></button>
        </div>
      </div>
    </section>
  )
}
