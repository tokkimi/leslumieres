import { useEffect, useMemo, useRef, useState } from 'react'
import { PRODUCTS, img } from '@/lib/menu'
import { BRUNCH, LISTS, PROGRAMS, SCREENS, loopFor, type Fx, type Row, type Scene, type Screen, type Spot } from './screens'

const LOGO = '/assets/img/logo/les-lumieres-clair.svg'
const price = (n: number) => n.toFixed(2).replace('.', ',')
const priceOf = (id: string) => PRODUCTS[id]?.p ?? 0
const params = new URLSearchParams(location.search)
const CAPTURE = params.has('capture')
const AT = Number(params.get("at")) || 0 // départ forcé dans la boucle (ms), pour les captures
const RATE = Number(params.get('rate')) || 1 // capture vidéo au ralenti, accélérée ensuite

/** Horloge commune : en direct, l'heure réelle (les écrans restent synchronisés) ; en capture vidéo, le temps depuis le début. */
function useClock(loop: number) {
  const start = useRef(performance.now())
  const [t, setT] = useState(0)
  useEffect(() => {
    let raf = 0
    const tick = () => {
      setT(CAPTURE ? AT + (performance.now() - start.current) * RATE : Date.now() % loop)
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [])
  return t
}

function sceneAt(t: number, scenes: Scene[], loop: number) {
  const cycle = Math.floor(t / loop)
  let r = t % loop
  for (let i = 0; i < scenes.length; i++) {
    if (r < scenes[i].ms) return { i, cycle, elapsed: r, left: scenes[i].ms - r }
    r -= scenes[i].ms
  }
  return { i: 0, cycle, elapsed: 0, left: scenes[0].ms }
}

/* ---------- Effets autour du produit ---------- */
function Effects({ fx }: { fx: Fx }) {
  if (fx === 'steam') {
    return (
      <div className="fx fx--steam" aria-hidden="true">
        {[0, 1, 2].map(i => (
          <svg key={i} viewBox="0 0 60 220" style={{ left: `${40 + i * 9}%`, animationDelay: `${i * 1.1}s` }}>
            <path d="M30 215 C 8 180, 52 150, 30 115 S 8 50, 30 5" />
          </svg>
        ))}
      </div>
    )
  }
  const n = fx === 'ice' ? 18 : 26
  return (
    <div className={`fx fx--${fx}`} aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <i key={i} style={{
          left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`,
          animationDelay: `${((i * 0.43) % 4).toFixed(2)}s`, animationDuration: `${3 + (i % 5) * 0.7}s`,
          ['--s' as string]: `${0.5 + (i % 4) * 0.35}`,
        }} />
      ))}
    </div>
  )
}

function Bulbs() {
  return (
    <div className="bulbs" aria-hidden="true">
      {Array.from({ length: 16 }, (_, i) => <span key={i} style={{ left: `${3 + i * 6.25}%`, height: `${18 + (i % 4) * 9}px`, animationDelay: `${-(i * 0.7) % 5}s` }}><i /></span>)}
    </div>
  )
}

/* ---------- Scènes ---------- */
function Intro({ s, elapsed, headline, tag }: { s: Screen; elapsed: number; headline?: string; tag?: string }) {
  const v = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const el = v.current
    if (!el) return
    const sync = () => { try { el.currentTime = (s.introOffset + elapsed / 1000) % (el.duration || 8.6) } catch { /* vidéo pas prête */ } }
    if (el.readyState >= 1) sync(); else el.addEventListener('loadedmetadata', sync, { once: true })
    el.playbackRate = RATE
    el.play().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="sc sc--intro">
      <video ref={v} className="intro__video" muted loop playsInline preload="auto">
        <source src="/assets/video/intro-paysage.mp4" type='video/mp4; codecs="avc1.640028"' />
        <source src="/assets/video/intro-paysage.webm" type="video/webm" />
      </video>
      <div className="intro__shade" />
      <div className="intro__txt">
        <span className="eyebrow">Les Lumières · cuisine du monde</span>
        <h1>{headline ?? s.headline}</h1>
        <span className="script">{tag ?? s.script}</span>
      </div>
    </div>
  )
}

function Logo() {
  return (
    <div className="sc sc--logo">
      <div className="logo__halo" />
      <div className="logo__rays" />
      <div className="logo__wrap">
        <img src={LOGO} alt="Les Lumières" />
        <span className="logo__shine" />
      </div>
      <p className="logo__sub">Champs-sur-Marne · depuis 2020</p>
    </div>
  )
}

function SpotScene({ s, spot }: { s: Screen; spot: Spot }) {
  const p = priceOf(spot.id)
  const [euros, cents] = price(p).split(',')
  return (
    <div className="sc sc--spot">
      <div className="spot__bg" />
      <Bulbs />
      <div className="spot__text">
        <span className="eyebrow">La suggestion · {s.eyebrow.toLowerCase()}</span>
        <h2>{spot.name}</h2>
        <p className="script">{spot.phrase}</p>
        <div className="spot__price">
          <span className="spot__price-n">{euros}<small>,{cents}</small></span>
          <span className="spot__price-e">€</span>
        </div>
      </div>
      <div className="spot__stage">
        <div className="spot__ring" />
        <div className="spot__halo" />
        <div className="spot__counter" />
        <div className="spot__shadow" />
        <div className="spot__float"><img src={img(spot.id)} alt="" /><img className="spot__refl" src={img(spot.id)} alt="" /></div>
        <Effects fx={s.fx} />
      </div>
    </div>
  )
}

/* Écran complet d'une catégorie (thés glacés, brunch, boissons chaudes) */
function ShowcaseScene({ s }: { s: Screen }) {
  const c = s.showcase
  return (
    <div className={`sc sc--show show--${s.n}`}>
      <div className="spot__bg" />
      <Bulbs />
      <header className="show__head">
        <span className="eyebrow">{c.eyebrow}</span>
        <h2>{c.title}</h2>
        <span className="script">{c.script}</span>
      </header>
      <div className="show__row">
        {c.items.map((it, i) => (
          <figure key={it.id} className="show__item" style={{ animationDelay: `${0.5 + i * 0.18}s` }}>
            <div className="show__img"><img src={img(it.id)} alt="" style={{ animationDelay: `${-i * 0.9}s` }} /></div>
            <figcaption>{it.name}</figcaption>
          </figure>
        ))}
        <Effects fx={s.fx} />
        <div className="shelf" />
      </div>
      <footer className="show__foot">
        <span className="show__line">{c.line}</span>
        <span className="show__price"><small>{c.priceLabel}</small>{c.price}</span>
      </footer>
    </div>
  )
}

/* Liste de prix sur une moitié d'écran, avec son visuel */
type PanelData = { title: string; script: string; rows: Row[]; hero: string; price?: number; unit?: string }
function Half({ d, side }: { d: PanelData; side: number }) {
  const flavors = d.price != null
  return (
    <section className={`half half--${flavors ? 'flavors' : 'list'}`} style={{ animationDelay: `${side * 0.25}s` }}>
      <Deco />
      <header className="half__head">
        <div>
          <span className="orn"><i />{d.script}<i /></span>
          <h3>{d.title}</h3>
          {flavors && <span className="half__price"><small>{d.unit ?? ''}</small>{price(d.price!)} €</span>}
        </div>
      </header>
      {!flavors && <div className="half__hero"><div className="spot__halo" /><img src={img(d.hero)} alt="" /></div>}
      {flavors ? (
        <div className={`half__flavors n${d.rows.length}`}>
          {d.rows.map((r, i) => (
            <figure key={r.id} style={{ animationDelay: `${0.4 + i * 0.08}s` }}>
              <img src={img(r.id)} alt="" style={{ animationDelay: `${-i * 0.7}s` }} />
              <figcaption>{r.name}</figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <ul className={`half__list n${d.rows.length > 8 ? 'l' : 's'}`}>
          {d.rows.map((r, i) => (
            <li key={r.id} style={{ animationDelay: `${0.4 + i * 0.07}s` }}>
              <img src={img(r.id)} alt="" />
              <span className="g-name">{r.name}</span>
              <span className="g-price">{price(priceOf(r.id))} €</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function Grid({ s }: { s: Screen }) {
  return (
    <div className={`sc sc--halves grid--${s.n}`}>
      <div className="grid__bg" />
      <div className="halves">
        {s.sections.slice(0, 2).map((sec, k) => {
          const hero = sec.kind === 'flavors' ? sec.rows[0].id : (sec.rows.find(r => r.id === s.feature.id) ?? sec.rows[0]).id
          return <Half key={k} side={k} d={{ title: sec.title, script: k === 0 ? s.script : s.eyebrow.toLowerCase(), rows: sec.rows, hero, price: sec.kind === 'flavors' ? sec.price : undefined, unit: s.n === 1 ? 'le verre' : 'la part' }} />
        })}
      </div>
    </div>
  )
}

/* Cadre Art déco : double filet doré, coins et losange */
function Deco() {
  return <div className="deco" aria-hidden="true"><span className="deco__c c1" /><span className="deco__c c2" /><span className="deco__c c3" /><span className="deco__c c4" /><span className="deco__gem" /></div>
}

/* ---------- Brunch ---------- */
function BrunchPlate({ big, delay = 0 }: { big?: boolean; delay?: number }) {
  return (
    <div className={`bplate${big ? ' bplate--big' : ''}`}>
      <div className="bplate__light" />
      <div className="bplate__board" style={{ animationDelay: `${delay}s` }} />
      {BRUNCH.plate.map((it, i) => (
        <div key={it.id} className={`bplate__it ${it.cls}`} style={{ animationDelay: `${delay + 0.35 + i * 0.32}s` }}>
          <img src={img(it.id)} alt="" style={{ animationDelay: `${-i * 1.3}s` }} />
        </div>
      ))}
    </div>
  )
}

function BrunchPanel({ side }: { side: number }) {
  return (
    <section className="half half--brunch" style={{ animationDelay: `${side * 0.25}s` }}>
      <Deco />
      <header className="bp__head">
        <span className="orn"><i />{BRUNCH.days}<i /></span>
        <h3><span>Formule</span><span className="script">brunch</span></h3>
      </header>
      <div className="bp__stage">
        <BrunchPlate delay={0.4} />
        <span className="medal"><small>{BRUNCH.priceLabel}</small><b>{BRUNCH.price}</b><em>{BRUNCH.hours}</em></span>
      </div>
      <ul className="bp__chips">{BRUNCH.contents.map((c, i) => <li key={c} style={{ animationDelay: `${2 + i * 0.15}s` }}>{c}</li>)}</ul>
    </section>
  )
}

/* Grande présentation du brunch, plein écran */
function BrunchShow() {
  return (
    <div className="sc sc--brunch">
      <div className="spot__bg" />
      <div className="bs__cone" />
      <Bulbs />
      <div className="bs__text">
        <span className="eyebrow">{BRUNCH.days}</span>
        <h2><span>Formule</span><span>brunch</span></h2>
        <span className="script">{BRUNCH.script}</span>
        <ul className="bs__list">
          {BRUNCH.contents.map((c, i) => <li key={c} style={{ animationDelay: `${4.6 + i * 0.35}s` }}><i />{c}</li>)}
        </ul>
      </div>
      <div className="bs__stage">
        <BrunchPlate big delay={1.4} />
        <div className="bs__coin"><small>{BRUNCH.priceLabel}</small><b>{BRUNCH.price}</b><span className="bs__coin-shine" /></div>
        <Effects fx="steam" />
      </div>
      <div className="bs__ribbon"><span>Samedi</span><i /><span>Dimanche</span><i /><span>{BRUNCH.hours}</span></div>
    </div>
  )
}

/* ---------- Liste plein écran ---------- */
function FullList({ id }: { id: string }) {
  const L = LISTS[id]
  const half = Math.ceil(L.rows.length / 2)
  const cols = [L.rows.slice(0, half), L.rows.slice(half)]
  return (
    <div className={`sc sc--list list--${id}`}>
      <div className="grid__bg" />
      <Bulbs />
      <Deco />
      <header className="fl__head">
        <span className="orn"><i />{L.eyebrow}<i /></span>
        <h2>{L.title}</h2>
        <span className="script">{L.script}{L.price != null && <b className="fl__badge">{price(L.price)} €</b>}</span>
      </header>
      <div className="fl__hero">
        <div className="spot__halo" />
        {L.hero.map((h, i) => <img key={h} src={img(h)} alt="" className={`fl__hero-${i}`} style={{ animationDelay: `${-i * 2}s` }} />)}
      </div>
      <div className="fl__cols">
        {cols.map((rows, c) => (
          <ul key={c}>
            {rows.map((r, i) => (
              <li key={r.id} style={{ animationDelay: `${0.6 + (c * half + i) * 0.08}s` }}>
                <img src={img(r.id)} alt="" />
                <span className="g-name">{r.name}</span>
                <span className="g-price">{price(priceOf(r.id))} €</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}

function panelOf(id: string, side: number) {
  if (id === 'brunch') return <BrunchPanel key={side} side={side} />
  const L = LISTS[id]
  return <Half key={side} side={side} d={{ title: L.title, script: L.script, rows: L.rows, hero: L.hero[0], price: L.price, unit: L.unit }} />
}

function Split({ left, right }: { left: string; right: string }) {
  const panel = panelOf
  return (
    <div className="sc sc--halves sc--split">
      <div className="grid__bg" />
      <Bulbs />
      <div className="halves">{panel(left, 0)}{panel(right, 1)}</div>
    </div>
  )
}

/* ---------- Écran ---------- */
const PROG = PROGRAMS[params.get('p') ?? '']
const N = Math.min(3, Math.max(1, Number(params.get('n')) || 1))
const PLAN: Scene[] = PROG ? PROG.scenes : loopFor(N)
const PLAN_LOOP = PLAN.reduce((a, x) => a + x.ms, 0)

export function Ecran() {
  const t = useClock(PLAN_LOOP)
  const { i, cycle, elapsed, left } = sceneAt(t, PLAN, PLAN_LOOP)
  const sc = PLAN[i]
  const scr = (n?: number) => SCREENS[(n ?? N) - 1]
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const fit = () => setScale(Math.min(innerWidth / 1920, innerHeight / 1080))
    fit(); addEventListener('resize', fit); return () => removeEventListener('resize', fit)
  }, [])
  // précharge les images utilisées
  useMemo(() => {
    const ids = new Set<string>(BRUNCH.plate.map(x => x.id))
    SCREENS.forEach(s => { s.spots.forEach(x => ids.add(x.id)); s.showcase.items.forEach(x => ids.add(x.id)); s.sections.forEach(x => x.rows.forEach(r => ids.add(r.id))) })
    ids.forEach(id => { const im = new Image(); im.src = img(id) })
  }, [])

  const leaving = PLAN.length > 1 && left < 700
  const panelId = params.get('panel')
  if (panelId) {
    // un seul panneau sur une demi-télé (960 × 1080), pour les montages vidéo écran divisé
    return (
      <div className="tv">
        <div className="stage stage--half" style={{ transform: `translate(-50%, -50%) scale(${Math.min(innerWidth / 960, innerHeight / 1080)})` }}>
          <div className="sc sc--halves sc--split">
            <div className="grid__bg" />
            <Bulbs />
            <div className="halves halves--one">{panelOf(panelId, 0)}</div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="tv">
      <div className="stage" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        <div key={PLAN.length > 1 ? `${cycle}-${i}` : "fixe"} className={`scene${leaving ? ' is-leaving' : ''}`}>
          {sc.kind === 'intro' && <Intro s={scr(sc.screen ?? 2)} elapsed={elapsed} headline={sc.headline} tag={sc.tag} />}
          {sc.kind === 'logo' && <Logo />}
          {sc.kind === 'spot' && <SpotScene s={scr(sc.screen)} spot={scr(sc.screen).spots[sc.spot]} />}
          {sc.kind === 'showcase' && <ShowcaseScene s={scr(sc.screen)} />}
          {sc.kind === 'grid' && <Grid s={scr(sc.screen)} />}
          {sc.kind === 'brunchShow' && <BrunchShow />}
          {sc.kind === 'split' && <Split left={sc.left} right={sc.right} />}
          {sc.kind === 'list' && <FullList id={sc.list} />}
        </div>
      </div>
    </div>
  )
}
