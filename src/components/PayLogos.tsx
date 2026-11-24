import { Banknote } from 'lucide-react'
import { PAIEMENTS } from '@/lib/contact'

/** Logos de paiement détourés, sans cadre. En mode « choix », chaque moyen devient une option cochable. */
export function PayLogos({ value, onChange }: { value?: string; onChange?: (v: string) => void }) {
  return (
    <div className="pays" role={onChange ? 'radiogroup' : undefined} aria-label="Moyens de paiement">
      {PAIEMENTS.map(p => {
        const body = (
          <>
            <span className="pays__marks">
              {p.logos.map(l => <img key={l} src={l} alt="" />)}
              {p.icon === 'cash' && <Banknote className="pays__cash" strokeWidth={1.5} aria-hidden="true" />}
              {p.wordmark && <span className="pays__word">{p.wordmark}</span>}
            </span>
            <small>{p.label}</small>
          </>
        )
        return onChange ? (
          <label key={p.label} className={`pays__item is-pick${value === p.label ? ' is-on' : ''}`}>
            <input type="radio" name="pay-counter" checked={value === p.label} onChange={() => onChange(p.label)} />
            {body}
          </label>
        ) : <span key={p.label} className="pays__item">{body}</span>
      })}
    </div>
  )
}
