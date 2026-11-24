import { useEffect, useMemo, useRef, useState } from 'react'
import { Minus, Plus, Trash2, X, ShoppingBag, Utensils, Check } from 'lucide-react'
import { GROUPS, LOGO, MODE_LABEL, eur, img, lower, store, type Chosen, type Line, type Mode, type ProductRef } from '@/lib/menu'

/* ---------- Fenêtre générique ---------- */
let openCount = 0
export function Modal({ onClose, children, className = '', ovClass = '', label }: { onClose: () => void; children: React.ReactNode; className?: string; ovClass?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    openCount++
    document.body.classList.add('locked')
    const prev = document.activeElement as HTMLElement | null
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose() } }
    addEventListener('keydown', k)
    setTimeout(() => ref.current?.querySelector<HTMLElement>('[data-autofocus],button')?.focus({ preventScroll: true }), 30)
    return () => { removeEventListener('keydown', k); openCount--; if (openCount <= 0) { openCount = 0; document.body.classList.remove('locked') } prev?.focus?.({ preventScroll: true }) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className={`overlay ${ovClass}`} onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div ref={ref} className={className} role="dialog" aria-modal="true" aria-label={label}>{children}</div>
    </div>
  )
}

export function ModeSwitch({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  return (
    <div className="mode" data-mode={mode} role="radiogroup" aria-label="Mode de commande">
      {(['emporter', 'surplace'] as Mode[]).map(m => (
        <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)}>
          {m === 'emporter' ? <ShoppingBag size={14} /> : <Utensils size={14} />}{MODE_LABEL[m]}
        </button>
      ))}
      <span className="mode__thumb" aria-hidden="true" />
    </div>
  )
}

/* ---------- Fiche produit ---------- */
export function ProductSheet({ p, onClose, onAdd, toast }: { p: ProductRef; onClose: () => void; onAdd: (opts: Chosen[], note: string, qty: number, from: HTMLElement | null) => void; toast: (m: string) => void }) {
  const groups = (p.o ?? []).map(k => GROUPS[k])
  const [sel, setSel] = useState<Record<number, number[]>>({})
  const [qty, setQty] = useState(1)
  const [note, setNote] = useState('')
  const [missing, setMissing] = useState<number[]>([])
  const imgRef = useRef<HTMLImageElement>(null)

  // groupes conditionnels : la sauce frites n'apparaît que si des frites sont choisies
  const shown = useMemo(() => {
    const s = new Set<string>()
    Object.entries(sel).forEach(([gi, arr]) => arr.forEach(oi => groups[+gi].o[oi].show?.forEach(c => s.add(c))))
    return s
  }, [sel, groups])
  const visible = (gi: number) => !groups[gi].hid || shown.has(groups[gi].c ?? '')

  const chosen: Chosen[] = groups.flatMap((g, gi) => visible(gi) ? (sel[gi] ?? []).map(oi => ({ g: g.t, n: g.o[oi].n, p: g.o[oi].p, rm: g.k === 'remove' })) : [])
  const unit = p.p + chosen.reduce((s, o) => s + o.p, 0)

  const toggle = (gi: number, oi: number) => {
    setSel(s => {
      const g = groups[gi], cur = s[gi] ?? []
      const next = g.k === 'single' ? [oi] : cur.includes(oi) ? cur.filter(x => x !== oi) : [...cur, oi]
      return { ...s, [gi]: next }
    })
    setMissing(m => m.filter(x => x !== gi))
  }
  const add = () => {
    const miss = groups.map((g, gi) => (g.req && visible(gi) && !(sel[gi]?.length)) ? gi : -1).filter(x => x >= 0)
    if (miss.length) {
      setMissing(miss)
      document.getElementById(`grp-${miss[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      toast('Choisissez : ' + miss.map(gi => lower(groups[gi].t)).join(', '))
      return
    }
    onAdd(chosen, note.trim(), qty, imgRef.current)
  }

  return (
    <Modal onClose={onClose} className="sheet" ovClass="overlay--top" label={p.n}>
      <button className="close" type="button" onClick={onClose} aria-label="Fermer"><X size={18} /></button>
      <div className="pd__head">
        <div className="pd__img"><img ref={imgRef} src={img(p.id)} alt="" /></div>
        <div className="grid gap-2 min-w-0">
          <p className="eyebrow">{p.cat.name}{p.sec.t ? ' · ' + p.sec.t : ''}</p>
          <h2>{p.n}</h2>
          {p.d && <p className="text-sm text-[var(--muted)] m-0">Composition : {p.d}.</p>}
          <p className="mono text-xl m-0">{eur(p.p)}</p>
        </div>
      </div>
      {groups.map((g, gi) => visible(gi) && (
        <fieldset key={gi} id={`grp-${gi}`} className={`grp${missing.includes(gi) ? ' is-missing' : ''}`}>
          <div className="grp__head">
            <legend className="grp__t">{g.t}</legend>
            <span className={`grp__h ${g.req ? (sel[gi]?.length ? 'ok' : 'req') : ''}`}>{g.req ? (sel[gi]?.length ? 'Choisi ✓' : 'Obligatoire') : g.k === 'remove' ? 'Sans supplément' : g.h || 'Facultatif'}</span>
          </div>
          <div className="opts">
            {g.o.map((o, oi) => (
              <label key={oi} className={`o${g.k === 'remove' ? ' o--rm' : ''}`}>
                <input type={g.k === 'single' ? 'radio' : 'checkbox'} name={`g${gi}`} checked={(sel[gi] ?? []).includes(oi)} onChange={() => toggle(gi, oi)} />
                <span>{g.k === 'remove' ? 'Sans ' : ''}{lower(o.n)}{o.p ? <em>+{eur(o.p)}</em> : null}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <label className="field mb-3">Une précision pour la cuisine ?
        <textarea rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="Allergie, sauce à part…" />
      </label>
      <div className="pd__foot">
        <div className="qty">
          <button type="button" aria-label="Retirer un" onClick={() => setQty(q => Math.max(1, q - 1))}><Minus size={16} /></button>
          <output>{qty}</output>
          <button type="button" aria-label="Ajouter un" onClick={() => setQty(q => Math.min(50, q + 1))}><Plus size={16} /></button>
        </div>
        <button className="btn btn--light flex-1" type="button" onClick={add}>Ajouter · <span className="mono">{eur(unit * qty)}</span></button>
      </div>
    </Modal>
  )
}

/* ---------- Panier ---------- */
export function CartDrawer({ cart, mode, setMode, onQty, onClose, onCheckout }: { cart: Line[]; mode: Mode; setMode: (m: Mode) => void; onQty: (i: number, d: number) => void; onClose: () => void; onCheckout: () => void }) {
  const total = cart.reduce((s, l) => s + l.unit * l.qty, 0)
  return (
    <Modal onClose={onClose} ovClass="drawer-ov" className="drawer" label="Mon panier">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><img src={LOGO} alt="" className="w-10 h-10" /><h2 className="m-0 text-xl font-black uppercase tracking-[.1em]">Mon panier</h2></div>
        <button className="close !static !m-0" type="button" onClick={onClose} aria-label="Fermer"><X size={18} /></button>
      </div>
      <ModeSwitch mode={mode} setMode={setMode} />
      <div className="flex-1 overflow-auto flex flex-col gap-3 p-1 -mx-1">
        {cart.length === 0 && (
          <div className="m-auto text-center grid gap-4 justify-items-center text-[var(--muted)] p-6">
            <img src={LOGO} alt="" className="w-20 opacity-30" />
            <p className="m-0">Votre panier est vide.<br />La borne, la vitrine et le bar vous attendent.</p>
            <button className="btn btn--ghost" type="button" onClick={onClose}>Continuer</button>
          </div>
        )}
        {cart.map((l, i) => (
          <div key={l.key} className="line">
            <div className="line__img"><img src={img(l.id)} alt="" /></div>
            <div className="min-w-0">
              <p className="m-0 text-[12.5px] font-extrabold uppercase tracking-[.08em]">{l.n}{l.sec && <span className="mono font-normal text-[var(--muted)]"> · {l.sec}</span>}</p>
              {(l.opts.length > 0 || l.note) && (
                <p className="m-0 mt-1 text-xs leading-snug text-[var(--muted)]">
                  {l.opts.map((o, k) => <span key={k} className={o.rm ? 'text-[var(--danger)]' : ''}>{k ? ' · ' : ''}{o.rm ? 'sans ' : ''}{lower(o.n)}{o.p ? ` (+${eur(o.p)})` : ''}</span>)}
                  {l.note && <span>{l.opts.length ? ' · ' : ''}« {l.note} »</span>}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end justify-between gap-2">
              <span className="mono text-sm">{eur(l.unit * l.qty)}</span>
              <div className="qty qty--sm">
                <button type="button" aria-label="Retirer un" onClick={() => onQty(i, -1)}>{l.qty === 1 ? <Trash2 size={13} /> : <Minus size={13} />}</button>
                <output>{l.qty}</output>
                <button type="button" aria-label="Ajouter un" onClick={() => onQty(i, 1)}><Plus size={13} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-3 pt-3 border-t border-[var(--line)]">
        <div className="flex justify-between items-baseline text-xs font-bold uppercase tracking-[.12em]"><span>Total</span><strong className="mono text-2xl tracking-normal">{eur(total)}</strong></div>
        <button className="btn btn--light w-full" type="button" disabled={!cart.length} onClick={onCheckout}>Valider ma commande</button>
      </div>
    </Modal>
  )
}

/* ---------- Connexion : petite pop-up ---------- */
export function Account({ onClose, toast }: { onClose: () => void; toast: (m: string) => void }) {
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [step, setStep] = useState(1)
  const [v, setV] = useState<Record<string, string>>({})
  const [err, setErr] = useState('')
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value })
  const inp = (k: string, label: string, type = 'text', ac?: string) => (
    <label className="acc__f"><input type={type} placeholder=" " autoComplete={ac} value={v[k] ?? ''} onChange={set(k)} /><span>{label}</span></label>
  )
  const login = (e: React.FormEvent) => {
    e.preventDefault()
    if (!v.id || !v.pw) return setErr('Saisissez votre e-mail et votre mot de passe.')
    toast('Bon retour parmi nous'); onClose()
  }
  const signup = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      if (!v.prenom || !v.nom || !/^\S+@\S+\.\S+$/.test(v.mail ?? '') || (v.tel ?? '').replace(/\D/g, '').length < 10) return setErr('Complétez vos coordonnées.')
      setErr(''); return setStep(2)
    }
    if (!v.pw || v.pw.length < 6) return setErr('Mot de passe : 6 caractères minimum.')
    store.set('profile', { nom: (v.nom ?? '').toUpperCase(), prenom: v.prenom, tel: v.tel, mail: v.mail })
    toast('Compte créé'); onClose()
  }
  return (
    <Modal onClose={onClose} className="acc" label="Mon compte">
      <button className="acc__x" type="button" onClick={onClose} aria-label="Fermer"><X size={16} /></button>
      <img src={LOGO} alt="" className="acc__logo" />
      <p className="acc__hello">{tab === 'login' ? 'Bon retour' : 'Bienvenue'}</p>
      <div className="acc__tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'login'} onClick={() => { setTab('login'); setErr('') }}>Connexion</button>
        <button type="button" role="tab" aria-selected={tab === 'signup'} onClick={() => { setTab('signup'); setStep(1); setErr('') }}>Créer un compte</button>
      </div>
      {tab === 'login' ? (
        <form onSubmit={login} noValidate className="acc__form">
          {inp('id', 'E-mail ou identifiant', 'text', 'username')}
          {inp('pw', 'Mot de passe', 'password', 'current-password')}
          {err && <p className="acc__err">{err}</p>}
          <button className="btn btn--light w-full" type="submit">Se connecter</button>
        </form>
      ) : (
        <form onSubmit={signup} noValidate className="acc__form">
          <div className="acc__steps"><i className="on" /><i className={step === 2 ? 'on' : ''} /></div>
          {step === 1 ? (<>
            <div className="grid grid-cols-2 gap-2">{inp('prenom', 'Prénom', 'text', 'given-name')}{inp('nom', 'Nom', 'text', 'family-name')}</div>
            {inp('tel', 'Téléphone', 'tel', 'tel')}
            {inp('mail', 'E-mail', 'email', 'email')}
          </>) : (<>
            {inp('adr', 'Adresse (facultatif)', 'text', 'street-address')}
            <div className="grid grid-cols-3 gap-2">{inp('etage', 'Étage')}{inp('bat', 'Bât.')}{inp('code', 'Code')}</div>
            {inp('pw', 'Mot de passe', 'password', 'new-password')}
          </>)}
          {err && <p className="acc__err">{err}</p>}
          <div className="flex gap-2">
            {step === 2 && <button className="btn btn--ghost" type="button" onClick={() => { setStep(1); setErr('') }}>Retour</button>}
            <button className="btn btn--light flex-1" type="submit">{step === 1 ? 'Continuer' : <><Check size={15} />Créer mon compte</>}</button>
          </div>
        </form>
      )}
    </Modal>
  )
}
