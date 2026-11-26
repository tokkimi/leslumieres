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

function SectionView({ sec, base }: { sec: Section; base: number }) {
  if (sec.kind === 'flavors') {
    return (
      <section className="g-sec g-sec--flavors">
        <header><h3>{sec.title}</h3><span className="g-price">{price(sec.price)} €</span></header>
        <div className="flavors">
          {sec.rows.map((r, i) => (
            <div key={r.id} className="flavor" style={{ animationDelay: `${(base + i) * 70}ms` }}>
              <img src={img(r.id)} alt="" /><span>{r.name}</span>
            </div>
          ))}
        </div>
      </section>
    )
  }
  const cols = sec.rows.length > 5 ? 2 : 1
  return (
    <section className={`g-sec g-sec--list cols-${cols}`}>
      <header><h3>{sec.title}</h3></header>
      <ul>
        {sec.rows.map((r, i) => (
          <li key={r.id} style={{ animationDelay: `${(base + i) * 70}ms` }}>
            <img src={img(r.id)} alt="" />
            <span className="g-name">{r.name}</span>
            <span className="g-dots" />
            <span className="g-price">{price(priceOf(r.id))} €</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Grid({ s }: { s: Screen }) {
  let base = 0
  return (
    <div className={`sc sc--grid grid--${s.n}`}>
      <div className="grid__bg" />
      <header className="grid__head">
        <div>
          <span className="eyebrow">{s.eyebrow}</span>
          <h2>{s.title}</h2>
          <span className="script">{s.script}</span>
        </div>
        <img src={LOGO} alt="" className="grid__logo" />
      </header>
      <div className="grid__body">
        <div className="grid__cols">
          {s.sections.map((sec, k) => { const el = <SectionView key={k} sec={sec} base={base} />; base += sec.rows.length; return el })}
        </div>
        <aside className="feature">
          <span className="eyebrow">Le préféré</span>
          <div className="feature__stage">
            <div className="spot__halo" />
            <div className="feature__float"><img src={img(s.feature.id)} alt="" /></div>
            <Effects fx={s.fx} />
          </div>
          <h4>{s.feature.name}</h4>
          <p className="script">{s.feature.phrase}</p>
          <span className="feature__price">{price(priceOf(s.feature.id))} €</span>
        </aside>
      </div>
      {s.band && (
        <footer className="band">
          <span className="band__t">{s.band.title}</span>
          <span className="script">{s.band.script}</span>
          <span className="band__txt">{s.band.text}</span>
          <span className="band__p">{s.band.price}</span>
        </footer>
      )}
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
          {sc.kind === 'grid' && <Grid s={s} />}
        </div>
      </div>
    </div>
  )
}
