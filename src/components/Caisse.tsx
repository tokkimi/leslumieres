import { useMemo, useState } from 'react'
import { ArrowLeft, Banknote, Check, CreditCard, Lock, X } from 'lucide-react'
import { LOGO, MODE_LABEL, eur, img, lower, store, type Line, type Mode } from '@/lib/menu'
import { Modal, ModeSwitch } from '@/components/Overlays'
import { PAIEMENTS } from '@/lib/contact'
import { Boules, Guirlande, Plafond } from '@/components/Lights'

type Profile = { nom: string; prenom: string; tel: string; mail: string }
type Step = 'comptoir' | 'paiement' | 'merci'

const fmtCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
const fmtExp = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d }
const luhn = (n: string) => { const d = n.replace(/\D/g, ''); let s = 0; for (let i = 0; i < d.length; i++) { let x = +d[d.length - 1 - i]; if (i % 2) { x *= 2; if (x > 9) x -= 9 } s += x } return d.length >= 13 && s % 10 === 0 }
const brand = (n: string) => /^4/.test(n) ? 'VISA' : /^(5[1-5]|2[2-7])/.test(n) ? 'Mastercard' : /^3[47]/.test(n) ? 'Amex' : 'CB'

/** La caisse : comptoir → paiement → merci (la commande arrive sur une table). */
export function Caisse({ cart, mode, setMode, onClose, onPaid, onLogin }: { cart: Line[]; mode: Mode; setMode: (m: Mode) => void; onClose: () => void; onPaid: () => void; onLogin: () => void }) {
  const total = cart.reduce((s, l) => s + l.unit * l.qty, 0)
  const [served] = useState(cart) // garde la commande pour l'écran de remerciement
  const [step, setStep] = useState<Step>('comptoir')
  const [f, setF] = useState<Profile>(() => store.get('profile', { nom: '', prenom: '', tel: '', mail: '' }))
  const [when, setWhen] = useState<'asap' | 'later'>('asap')
  const [time, setTime] = useState('')
  const [bad, setBad] = useState<string[]>([])
  const [how, setHow] = useState<'carte' | 'comptoir'>('carte')
  const [counterPay, setCounterPay] = useState('Espèces')
  const [card, setCard] = useState({ num: '', name: '', exp: '', cvc: '' })
  const [flip, setFlip] = useState(false)
  const [paying, setPaying] = useState(false)
  const [num] = useState(() => 'LL-' + Math.floor(1000 + Math.random() * 9000))
  const times = useMemo(() => {
    const d = new Date(Date.now() + 25 * 60000); d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0)
    return Array.from({ length: 14 }, (_, i) => new Date(d.getTime() + i * 900000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
  }, [])
  const whenTxt = when === 'asap' ? 'dès que possible' : 'pour ' + (time || times[0])

  const toPay = (e: React.FormEvent) => {
    e.preventDefault()
    const b: string[] = []
    if (!f.nom.trim()) b.push('nom')
    if (!f.prenom.trim()) b.push('prenom')
    if (f.tel.replace(/\D/g, '').length < 10) b.push('tel')
    if (!/^\S+@\S+\.\S+$/.test(f.mail)) b.push('mail')
    setBad(b)
    if (b.length) return
    store.set('profile', f)
    setStep('paiement')
  }
  const pay = (e: React.FormEvent) => {
    e.preventDefault()
    if (how === 'carte') {
      const b: string[] = []
      if (!luhn(card.num)) b.push('num')
      if (card.name.trim().length < 3) b.push('name')
      const [mm, yy] = card.exp.split('/').map(Number)
      if (!mm || mm > 12 || !yy || (2000 + yy) * 12 + mm < new Date().getFullYear() * 12 + new Date().getMonth() + 1) b.push('exp')
      if (card.cvc.length < 3) b.push('cvc')
      setBad(b)
      if (b.length) return
    }
    setPaying(true)
    setTimeout(() => { setPaying(false); setStep('merci'); onPaid() }, how === 'carte' ? 1600 : 700)
  }
  const field = (k: keyof Profile, label: string, type = 'text', ac = '') => (
    <label className="acc__f"><input type={type} placeholder=" " autoComplete={ac} value={f[k]} aria-invalid={bad.includes(k)} onChange={e => setF({ ...f, [k]: e.target.value })} /><span>{label}</span></label>
  )
  const digits = card.num.replace(/\D/g, '')

  return (
    <Modal onClose={onClose} ovClass="caisse-ov" className={`caisse caisse--${step}`} label="La caisse">
      {/* Le décor : face au comptoir */}
      <div className="caisse__decor" aria-hidden="true">
        <Plafond /><Guirlande count={16} top={88} /><Boules drops={[60, 24, 80]} />
        {step !== 'merci' && (
          <div className="comptoir">
            <div className="ticket">
              <img src={LOGO} alt="" />
              <b>Les Lumières</b>
              {served.slice(0, 6).map(l => <span key={l.key}><i>{l.qty}× {lower(l.n)}</i><i>{eur(l.unit * l.qty)}</i></span>)}
              {served.length > 6 && <span><i>+ {served.length - 6} autre(s)</i><i /></span>}
              <span className="ticket__tot"><i>Total</i><i>{eur(total)}</i></span>
            </div>
            <div className={`tpe${step === 'paiement' ? ' is-on' : ''}${paying ? ' is-paying' : ''}`}>
              <div className="tpe__screen">{paying ? 'Paiement…' : step === 'paiement' ? eur(total) : 'Bonjour'}</div>
              <div className="tpe__keys">{Array.from({ length: 12 }, (_, i) => <i key={i} />)}</div>
            </div>
            <div className="comptoir__top" /><div className="comptoir__front" />
          </div>
        )}
        {step === 'merci' && (
          <div className="table-scene">
            <div className="table-top" />
            <div className="table-dishes">
              {served.flatMap(l => Array.from({ length: Math.min(l.qty, 3) }, (_, k) => l.id + '-' + k)).slice(0, 8).map((key, i) => (
                <img key={key} src={img(key.split('-')[0])} alt="" style={{ animationDelay: `${.5 + i * .28}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      <button className="caisse__x" type="button" onClick={onClose} aria-label="Fermer la caisse"><X size={18} /></button>

      {step === 'comptoir' && (
        <form className="caisse__panel" onSubmit={toPay} noValidate>
          <p className="caisse__eyebrow">La caisse · 1/2</p>
          <h2 className="caisse__t">Au comptoir</h2>
          <ModeSwitch mode={mode} setMode={setMode} />
          <p className="m-0 text-sm text-[var(--muted)]">Déjà client ? <button type="button" className="text-[var(--ambre)] underline underline-offset-2 font-semibold" onClick={onLogin}>Se connecter</button></p>
          <div className="grid grid-cols-2 gap-2">{field('prenom', 'Prénom', 'text', 'given-name')}{field('nom', 'Nom', 'text', 'family-name')}</div>
          {field('tel', 'Téléphone', 'tel', 'tel')}
          {field('mail', 'E-mail', 'email', 'email')}
          <div className="flex flex-wrap gap-2 items-center">
            <label className="choice relative"><input type="radio" checked={when === 'asap'} onChange={() => setWhen('asap')} /><span>Dès que possible</span></label>
            <label className="choice relative"><input type="radio" checked={when === 'later'} onChange={() => setWhen('later')} /><span>Plus tard</span></label>
            {when === 'later' && <select className="caisse__select" value={time || times[0]} onChange={e => setTime(e.target.value)} aria-label="Horaire">{times.map(t => <option key={t}>{t}</option>)}</select>}
          </div>
          {bad.length > 0 && <p className="acc__err" role="alert">Vérifiez les champs en rouge.</p>}
          <button className="btn btn--light w-full" type="submit">Passer au paiement · <span className="mono">{eur(total)}</span></button>
        </form>
      )}

      {step === 'paiement' && (
        <form className="caisse__panel" onSubmit={pay} noValidate>
          <div className="flex items-center gap-2">
            <button type="button" className="caisse__back" onClick={() => { setStep('comptoir'); setBad([]) }} aria-label="Retour"><ArrowLeft size={16} /></button>
            <p className="caisse__eyebrow m-0">La caisse · 2/2</p>
          </div>
          <h2 className="caisse__t">Paiement</h2>
          <div className="paytabs" role="tablist">
            <button type="button" role="tab" aria-selected={how === 'carte'} onClick={() => setHow('carte')}><CreditCard size={15} />Carte bancaire</button>
            <button type="button" role="tab" aria-selected={how === 'comptoir'} onClick={() => setHow('comptoir')}><Banknote size={15} />Au comptoir</button>
          </div>
          {how === 'carte' ? (<>
            <div className={`ccard${flip ? ' is-flip' : ''}`} aria-hidden="true">
              <div className="ccard__face ccard__front">
                <div className="flex justify-between items-start"><img src={LOGO} alt="" className="w-10" /><span className="ccard__brand">{brand(digits)}</span></div>
                <div className="ccard__chip" />
                <div className="ccard__num mono">{(fmtCard(card.num) || '•••• •••• •••• ••••').padEnd(19, '•')}</div>
                <div className="flex justify-between gap-3 text-[10px] uppercase tracking-[.14em]">
                  <span className="min-w-0 truncate"><small>Titulaire</small>{card.name || 'Prénom Nom'}</span>
                  <span className="flex-none"><small>Expire</small><span className="mono">{card.exp || 'MM/AA'}</span></span>
                </div>
              </div>
              <div className="ccard__face ccard__back">
                <div className="ccard__strip" />
                <div className="ccard__sig"><span className="mono">{card.cvc.replace(/./g, '•') || '•••'}</span></div>
              </div>
            </div>
            <label className="acc__f"><input inputMode="numeric" autoComplete="off" placeholder=" " value={fmtCard(card.num)} aria-invalid={bad.includes('num')} onChange={e => setCard({ ...card, num: e.target.value })} onFocus={() => setFlip(false)} /><span>Numéro de carte</span></label>
            <label className="acc__f"><input autoComplete="off" placeholder=" " value={card.name} aria-invalid={bad.includes('name')} onChange={e => setCard({ ...card, name: e.target.value.toUpperCase() })} onFocus={() => setFlip(false)} /><span>Nom sur la carte</span></label>
            <div className="grid grid-cols-2 gap-2">
              <label className="acc__f"><input inputMode="numeric" autoComplete="off" placeholder=" " value={card.exp} aria-invalid={bad.includes('exp')} onChange={e => setCard({ ...card, exp: fmtExp(e.target.value) })} onFocus={() => setFlip(false)} /><span>MM/AA</span></label>
              <label className="acc__f"><input inputMode="numeric" autoComplete="off" placeholder=" " value={card.cvc} aria-invalid={bad.includes('cvc')} onChange={e => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })} onFocus={() => setFlip(true)} onBlur={() => setFlip(false)} /><span>Cryptogramme</span></label>
            </div>
          </>) : (
            <div className="grid gap-2">
              <p className="m-0 text-sm text-[var(--muted)]">Vous réglez {mode === 'emporter' ? 'au retrait' : 'au comptoir'} :</p>
              <div className="paylogos">
                {PAIEMENTS.map(p => (
                  <label key={p.label} className="paypick"><input type="radio" checked={counterPay === p.label} onChange={() => setCounterPay(p.label)} /><span className="paylogo"><span><img src={p.logo} alt="" /></span><small>{p.label}</small></span></label>
                ))}
              </div>
            </div>
          )}
          {bad.length > 0 && how === 'carte' && <p className="acc__err" role="alert">Vérifiez les informations de la carte.</p>}
          <button className="btn btn--light w-full" type="submit" disabled={paying}>
            {paying ? 'Paiement en cours…' : <><Lock size={14} />{how === 'carte' ? 'Payer' : 'Valider'} · <span className="mono">{eur(total)}</span></>}
          </button>
          <p className="m-0 text-center mono text-[10px] text-[#6f675d]">Maquette : paiement fictif, aucune donnée n’est enregistrée ni transmise.</p>
        </form>
      )}

      {step === 'merci' && (
        <div className="caisse__merci">
          <img src={LOGO} alt="" className="merci__logo" />
          <h2 className="merci__t">Merci pour votre commande</h2>
          <p className="m-0">Commande <b className="mono">{num}</b> · {MODE_LABEL[mode]} · {whenTxt}</p>
          <p className="m-0 text-sm text-[var(--muted)]">{f.prenom}, on s’occupe de tout. {how === 'carte' ? 'Paiement par carte accepté.' : `Règlement ${lower(counterPay)} ${mode === 'emporter' ? 'au retrait' : 'au comptoir'}.`}</p>
          <button className="btn btn--light mt-1" type="button" onClick={onClose}><Check size={15} />Retour en salle</button>
        </div>
      )}
    </Modal>
  )
}
