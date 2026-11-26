import { useEffect, useMemo, useRef, useState } from 'react'
import { PRODUCTS, img } from '@/lib/menu'
import { LOOP, SCENES, SCREENS, type Fx, type Screen, type Section, type Spot } from './screens'

const LOGO = '/assets/img/logo/les-lumieres-clair.svg'
const price = (n: number) => n.toFixed(2).replace('.', ',')
const priceOf = (id: string) => PRODUCTS[id]?.p ?? 0
const params = new URLSearchParams(location.search)
const CAPTURE = params.has('capture')
const AT = Number(params.get("at")) || 0 // départ forcé dans la boucle (ms), pour les captures
const RATE = Number(params.get('rate')) || 1 // capture vidéo au ralenti, accélérée ensuite

/** Horloge commune : en direct, l'heure réelle (les écrans restent synchronisés) ; en capture vidéo, le temps depuis le début. */
function useClock() {
  const start = useRef(performance.now())
  const [t, setT] = useState(0)
  useEffect(() => {
    let raf = 0
    const tick = () => {
      setT(CAPTURE ? AT + (performance.now() - start.current) * RATE : Date.now() % LOOP)
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [])
  return t
}

function sceneAt(t: number) {
  const cycle = Math.floor(t / LOOP)
  let r = t % LOOP
  for (let i = 0; i < SCENES.length; i++) {
    if (r < SCENES[i].ms) return { i, cycle, elapsed: r, left: SCENES[i].ms - r }
    r -= SCENES[i].ms
  }
  return { i: 0, cycle, elapsed: 0, left: SCENES[0].ms }
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
function Intro({ s, elapsed }: { s: Screen; elapsed: number }) {
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
        <h1>{s.headline}</h1>
        <span className="script">{s.script}</span>
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
        <div className="spot__halo" />
        <div className="spot__shadow" />
        <div className="spot__float"><img src={img(spot.id)} alt="" /></div>
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
      </div>
      <footer className="show__foot">
        <span className="show__line">{c.line}</span>
        <span className="show__price"><small>{c.priceLabel}</small>{c.price}</span>
      </footer>
    </div>
  )
}

/* Liste de prix sur une moitié d'écran, avec son visuel */
function Half({ sec, s, side }: { sec: Section; s: Screen; side: number }) {
  const hero = sec.kind === 'flavors' ? sec.rows[Math.min(2, sec.rows.length - 1)] : sec.rows.find(r => r.id === s.feature.id) ?? sec.rows[0]
  return (
    <section className={`half half--${sec.kind}`} style={{ animationDelay: `${side * 0.25}s` }}>
      <header className="half__head">
        <div>
          <h3>{sec.title}</h3>
          {sec.kind === 'flavors' ? <span className="half__price">{price(sec.price)} €</span> : <span className="script">{side === 0 ? s.script : s.eyebrow.toLowerCase()}</span>}
        </div>
        {sec.kind === 'list' && <div className="half__hero"><div className="spot__halo" /><img src={img(hero.id)} alt="" /></div>}
      </header>
      {sec.kind === 'flavors' ? (
        <div className={`half__flavors n${sec.rows.length}`}>
          {sec.rows.map((r, i) => (
            <figure key={r.id} style={{ animationDelay: `${0.4 + i * 0.08}s` }}>
              <img src={img(r.id)} alt="" style={{ animationDelay: `${-i * 0.7}s` }} />
              <figcaption>{r.name}</figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <ul className={`half__list n${sec.rows.length > 8 ? 'l' : 's'}`}>
          {sec.rows.map((r, i) => (
            <li key={r.id} style={{ animationDelay: `${0.4 + i * 0.07}s` }}>
              <img src={img(r.id)} alt="" />
              <span className="g-name">{r.name}</span>
              <span className="g-dots" />
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
        {s.sections.slice(0, 2).map((sec, k) => <Half key={k} sec={sec} s={s} side={k} />)}
      </div>
    </div>
  )
}

/* ---------- Écran ---------- */
export function Ecran() {
  const n = Math.min(3, Math.max(1, Number(params.get('n')) || 1))
  const s = SCREENS[n - 1]
  const t = useClock()
  const { i, cycle, elapsed, left } = sceneAt(t)
  const sc = SCENES[i]
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const fit = () => setScale(Math.min(innerWidth / 1920, innerHeight / 1080))
    fit(); addEventListener('resize', fit); return () => removeEventListener('resize', fit)
  }, [])
  // précharge les images de l'écran
  useMemo(() => {
    const ids = [...s.spots.map(x => x.id), s.feature.id, ...s.sections.flatMap(x => x.rows.map(r => r.id))]
    ids.forEach(id => { const im = new Image(); im.src = img(id) })
  }, [s])

  const leaving = left < 700
  return (
    <div className="tv">
      <div className="stage" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        <div key={`${cycle}-${i}`} className={`scene${leaving ? ' is-leaving' : ''}`}>
          {sc.kind === 'intro' && <Intro s={s} elapsed={elapsed} />}
          {sc.kind === 'logo' && <Logo />}
          {sc.kind === 'spot' && <SpotScene s={s} spot={s.spots[sc.spot]} />}
          {sc.kind === 'showcase' && <ShowcaseScene s={s} />}
          {sc.kind === 'grid' && <Grid s={s} />}
        </div>
      </div>
    </div>
  )
}
