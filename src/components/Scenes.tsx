import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, ChevronRight, Plus, X } from 'lucide-react'
import { CATS, GROUPS, LOGO, catById, countCat, eur, img, type Category, type Mode, type ProductRef, PRODUCTS } from '@/lib/menu'
import { Modal, ModeSwitch } from '@/components/Overlays'
import { Bocaux, Boules, CadreNeon, Guirlande, Plafond } from '@/components/Lights'

type Pick = (p: ProductRef, from: HTMLElement | null) => void

const qtyOf = (cartQty: Record<string, number>, id: string) => cartQty[id] ? <span className="qty-badge">{cartQty[id]}</span> : null

/* ================= La borne ================= */
type BoardLine = { id: string; n: string; p: number; p2?: number }
type Board = { t: string; cat: string; head?: [string, string]; groups: { t?: string; lines: BoardLine[] }[] }
const pretty = (n: string) => n.toLowerCase().replace(/^burger /, '')
const price = (n: number) => n.toFixed(2).replace('.', ',')

function buildBoards(): Board[] {
  const items = (id: string) => catById(id).sections.flatMap(s => s.items).map(p => ({ id: p.id, n: p.n, p: p.p }))
  const b = catById('burgers')
  const seul = b.sections[0].items, menu = b.sections[1].items
  return [
    { t: 'Pour commencer', cat: 'entrees', groups: [{ t: 'Entrées', lines: items('entrees') }, { t: 'Salades', lines: items('salades') }, { t: 'Nos créations', lines: items('creations') }] },
    { t: 'Saveurs d’Asie', cat: 'thai', groups: [{ t: 'Thaï', lines: items('thai') }, { t: 'Indien', lines: items('indien') }] },
    { t: 'Les classiques', cat: 'brasserie', groups: [{ t: 'Brasserie', lines: items('brasserie') }, { t: 'Pâtes', lines: items('pates') }] },
    { t: 'Burgers maison', cat: 'burgers', head: ['seul', 'menu'], groups: [{ lines: seul.map(p => ({ id: p.id, n: p.n, p: p.p, p2: menu.find(m => m.n === p.n)?.p })) }, { t: 'Menu enfant', lines: items('enfant').slice(0, 2) }] },
  ]
}

export function BorneScene({ openKiosk, next }: { openKiosk: (cat?: string) => void; next: () => void }) {
  const boards = useMemo(buildBoards, [])
  const [awake, setAwake] = useState(false)
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    // la vidéo ne tourne que lorsque la borne est à l'écran (batterie et fluidité sur mobile)
    const io = new IntersectionObserver(([e]) => {
      setAwake(e.isIntersecting)
      ref.current?.querySelectorAll('video').forEach(v => {
        if (e.isIntersecting && v.offsetParent) v.play().catch(() => { /* lecture auto refusée : l'affiche reste visible */ })
        else v.pause()
      })
    }, { threshold: .2 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  const [boardIdx, setBoardIdx] = useState(0)
  const toKiosk = () => document.getElementById('borne-kiosk')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="wall-run wall-brick">
      <section id="borne" className="scene screen gutter">
        <Plafond /><Guirlande count={22} />
        <Bocaux items={[{ x: '7%', drop: 260, size: .8, hideSm: true }, { x: '93%', drop: 230, size: .8 }]} />
        <div className="scene__head">
          <span className="scene__eyebrow">Étape 1 · La borne</span>
          <h2 className="scene__title">Commandez à la borne</h2>
          <p className="scene__lead">Comme en salle : touchez l’écran, composez vos plats (cuisson, accompagnement, sauces, sans tomate…) et retrouvez tout dans le panier lumineux.</p>
        </div>

        <div className="borne-wall borne-wall--boards">
          <div className="boards" aria-label="Écrans du menu" onScroll={e => { const el = e.currentTarget; setBoardIdx(Math.round(el.scrollLeft / Math.max(1, el.clientWidth))) }}>
            {boards.map(bd => (
              <button key={bd.t} type="button" className="board" onClick={() => openKiosk(bd.cat)} aria-label={`Commander : ${bd.t}`}>
                <span className="board__t">{bd.t}</span>
                {bd.head && <span className="board__head"><span /><span>{bd.head[0]}</span><span>{bd.head[1]}</span></span>}
                {bd.groups.map((g, gi) => (
                  <span key={gi} className="board__grp">
                    {g.t && <span className="board__g">{g.t}</span>}
                    {g.lines.map(l => (
                      <span key={l.id} className={`board__item${bd.head ? ' has-2' : ''}`}>
                        <span className="board__n">{pretty(l.n)}</span>
                        <span className="board__p">{price(l.p)}</span>
                        {bd.head && <span className="board__p">{l.p2 ? price(l.p2) : ''}</span>}
                      </span>
                    ))}
                  </span>
                ))}
              </button>
            ))}
          </div>
          <div className="boards__dots" aria-hidden="true">{boards.map((bd, i) => <i key={bd.t} className={i === boardIdx ? 'on' : ''} />)}</div>
        </div>
        <div className="next-step"><button type="button" onClick={toKiosk}>La borne <ArrowDown size={15} /></button></div>
      </section>

      <section id="borne-kiosk" ref={ref} className="scene screen gutter">
        <div className="kiosk-stage">
          <button type="button" className={`kiosk kiosk--big${awake ? ' is-awake' : ''}`} onClick={() => openKiosk()} aria-label="Ouvrir la borne de commande">
            <div className="kiosk__screen">
              <video className="kiosk__video" src="/assets/video/borne.mp4" poster="/assets/video/borne-poster.webp" muted loop playsInline preload="metadata" aria-hidden="true" />
              <span className="kiosk__shade" />
              <img src={LOGO} alt="" className="kiosk__logo" />
              <span className="kiosk__touch"><span className="kt-long">Touchez pour commander</span><span className="kt-short">Commander</span></span>
            </div>
          </button>
        </div>
        <div className="next-step"><button type="button" onClick={next}>Ensuite, la vitrine des desserts <ArrowDown size={15} /></button></div>
        <div className="floor" />
      </section>
    </div>
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
          <img src={LOGO} alt="" className="h-9 w-auto" />
          <span className="hidden sm:block font-extrabold text-xs tracking-[.28em] uppercase mr-auto">Les Lumières</span>
          <div className="w-[min(300px,58vw)] ml-auto sm:ml-0"><ModeSwitch mode={mode} setMode={setMode} /></div>
          <button type="button" className="close !static !m-0 flex-none" onClick={onClose} aria-label="Fermer la borne"><X size={18} /></button>
        </header>
        <div className="grid min-h-0 md:grid-cols-[220px_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] md:grid-rows-1">
          <nav className="kiosk-ui__nav" aria-label="Rubriques">
            {CATS.map(c => (
              <button key={c.id} type="button" className="kiosk-ui__cat" aria-current={c.id === cat.id} onClick={() => setCat(c)}>
                <span className="kiosk-ui__dot" aria-hidden="true" />{c.name}
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
function PriceTag({ name, price: pr }: { name: string; price: number }) {
  return <span className="tag"><span className="tag__n">{name}</span><span className="tag__p">{eur(pr)}</span></span>
}

export function VitrineScene({ onPick, cartQty, next }: { onPick: Pick; cartQty: Record<string, number>; next: () => void }) {
  const items = catById('desserts').sections.flatMap(s => s.items)
  const shelves: [string, typeof items][] = [
    ['Tiramisus maison', items.filter(p => p.n.includes('TIRAMISU'))],
    ['Cheesecakes & tartelettes', items.filter(p => /CHEESECAKE|TARTELETTE|SUCCES|TRILECE/.test(p.n))],
    ['Gourmandises', items.filter(p => !/TIRAMISU|CHEESECAKE|TARTELETTE|SUCCES|TRILECE/.test(p.n))],
  ]
  return (
    <section id="vitrine" className="scene screen wall-brick gutter">
      <Plafond /><Guirlande count={20} top={92} />
      <CadreNeon src={LOGO} className="right-[4%] top-[150px] hidden xl:grid" />
      <div className="scene__head">
        <span className="scene__eyebrow">Étape 2 · La vitrine</span>
        <h2 className="scene__title">Une douceur ?</h2>
        <p className="scene__lead">Nos desserts maison vous attendent derrière la vitre. Touchez celui qui vous fait envie, il file dans votre panier.</p>
      </div>
      <div className="case">
        <div className="case__top"><span>Pâtisseries maison</span></div>
        <div className="case__body">
          {shelves.map(([t, list]) => (
            <div key={t} className="case__level">
              <span className="case__label">{t}</span>
              <div className="case__row">
                {list.map(p => (
                  <button key={p.id} type="button" className="item" onClick={e => onPick(PRODUCTS[p.id], e.currentTarget.querySelector('img'))} aria-label={`Ajouter ${p.n.toLowerCase()}, ${eur(p.p)}`}>
                    {qtyOf(cartQty, p.id)}
                    <span className="item__img"><img src={img(p.id)} alt="" loading="lazy" /></span>
                    <PriceTag name={p.n.replace('TIRAMISU ', 'Tiramisu ')} price={p.p} />
                    <span className="add-badge"><Plus size={14} /></span>
                  </button>
                ))}
              </div>
              <div className="case__glass-shelf" />
            </div>
          ))}
          <span className="case__reflect" aria-hidden="true" />
        </div>
        <div className="case__base"><span className="case__kick" /></div>
      </div>
      <div className="next-step"><button type="button" onClick={next}>Ensuite, le bar <ArrowDown size={15} /></button></div>
      <div className="floor" />
    </section>
  )
}

/* ================= Le bar ================= */
const BAR_TABS: [string, string][] = [['Cocktails sans alcool', 'Cocktails'], ['Thés glacés', 'Thés glacés'], ['Boissons chaudes', 'Chaudes'], ['Softs', 'Softs']]

export function BarScene({ onPick, cartQty, onFinish, count }: { onPick: Pick; cartQty: Record<string, number>; onFinish: () => void; count: number }) {
  const b = catById('boissons')
  const [tab, setTab] = useState(BAR_TABS[0][0])
  const sec = b.sections.find(s => s.t === tab)!
  // deux étagères bien rangées : la moitié des boissons sur chacune
  const half = Math.ceil(sec.items.length / 2)
  const shelves = [sec.items.slice(0, half), sec.items.slice(half)].filter(r => r.length)
  return (
    <section id="bar" className="scene screen wall-bar gutter">
      <Plafond /><Boules drops={[40, 16, 56]} />
      <Bocaux items={[{ x: '6%', drop: 120, size: .8, hideSm: true }, { x: '94%', drop: 100, size: .8, hideSm: true }]} />
      <div className="scene__head">
        <span className="scene__eyebrow">Étape 3 · Le bar</span>
        <h2 className="scene__title">Et à boire ?</h2>
        <div className="bar-tabs" role="tablist" aria-label="Boissons">
          {BAR_TABS.map(([key, label]) => {
            const n = b.sections.find(s => s.t === key)?.items.length ?? 0
            return <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)}>{label}<small>{n}</small></button>
          })}
        </div>
      </div>
      <div className="bar-stage">
        <div className="backbar" key={tab}>
          {shelves.map((row, i) => (
            <div key={i} className="shelf">
              <div className="shelf__row">
                {row.map(p => (
                  <button key={p.id} type="button" className="item item--drink" onClick={e => onPick(PRODUCTS[p.id], e.currentTarget.querySelector('img'))} aria-label={`Ajouter ${p.n.toLowerCase()}, ${eur(p.p)}`}>
                    {qtyOf(cartQty, p.id)}
                    <span className="item__img"><img src={img(p.id)} alt="" loading="lazy" /></span>
                    <PriceTag name={p.n} price={p.p} />
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
            <button type="button" className="btn" onClick={onFinish}>{count > 0 && <span className="btn__count">{count}</span>}{count ? 'Finaliser ma commande' : 'Voir mon panier'}<ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </section>
  )
}
