import { useRef, useState, type FormEvent } from 'react'
import { ArrowRight, Mail } from '../../components/common/Icons'
import { useSiteData } from '../../data/runtime/SiteDataProvider'

export function Presale() {
  const { data } = useSiteData()
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [invalid, setInvalid] = useState<'email' | 'consent' | null>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const consentRef = useRef<HTMLInputElement>(null)
  const statusRef = useRef<HTMLParagraphElement>(null)
  const busy = useRef(false)
  if (data.salesStage !== 'prelaunch') return <section id="przedsprzedaz" className="presale-section"><div className="shell"><h2>Informacje o przedsprzedaży</h2><p>Aktualną ofertę znajdziesz w sekcji <a href="#domy">Domy i ceny</a>.</p><Unsubscribe /></div></section>
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy.current) return
    const address = email.trim()
    if (!address || !emailRef.current?.validity.valid) { setInvalid('email'); setState('error'); setMessage('Wpisz poprawny adres e-mail.'); emailRef.current?.focus(); return }
    if (!consent) { setInvalid('consent'); setState('error'); setMessage('Zaznacz zgodę na wiadomość o przedsprzedaży.'); consentRef.current?.focus(); return }
    const form = event.currentTarget
    busy.current = true; setInvalid(null); setState('sending'); setMessage('Zapisywanie…')
    try {
      const response = await fetch('/api/presale.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(15000), body: JSON.stringify({ email: address, consent: true, consentVersion: 'presale-1.0', website: new FormData(form).get('website') || '' }) })
      const result = await response.json().catch(() => ({ ok: false }))
      if (!response.ok || !result.ok) throw new Error(result.message || 'Nie udało się zapisać. Spróbuj ponownie później.')
      setState('success'); setMessage(result.preview ? 'Tryb podglądu: formularz działa, ale adres nie został zapisany na listę.' : 'Dziękujemy za zapis. Powiadomimy Cię e-mailem o starcie przedsprzedaży i warunkach promocji.')
      setEmail(''); setConsent(false)
    } catch (error) {
      setState('error'); setMessage(error instanceof TypeError ? 'Brak połączenia. Spróbuj ponownie — wpisany adres pozostał w formularzu.' : error instanceof DOMException ? 'Serwer nie odpowiedział na czas. Spróbuj ponownie później.' : error instanceof Error ? error.message : 'Nie udało się zapisać. Spróbuj ponownie.')
    } finally { busy.current = false; requestAnimationFrame(() => statusRef.current?.focus()) }
  }
  return <section id="przedsprzedaz" className="presale-section" aria-labelledby="presale-title">
    <div className="shell presale-section__grid">
      <div className="presale-section__copy"><div className="section-kicker"><span />Przed pierwszym etapem</div>
        <h2 id="presale-title">Twój dom zaczyna się<br /><em>od pierwszej wiadomości.</em></h2>
        <p>Przygotowujemy specjalną ofertę przedsprzedażową przed rozpoczęciem budowy. Zostaw e-mail — poznasz datę startu i warunki promocji, gdy będą gotowe.</p>
        <span className="presale-section__note">Bez zobowiązań. Zapis nie jest rezerwacją domu.</span>
      </div>
      <div className="presale-section__signup"><form className="presale-form" aria-labelledby="presale-form-title" aria-busy={state === 'sending'} onSubmit={submit} noValidate>
        <Mail size={25} aria-hidden="true" /><h3 id="presale-form-title">Daj znać, kiedy ruszy przedsprzedaż</h3>
        <label htmlFor="presale-email">Twój adres e-mail</label>
        <input ref={emailRef} id="presale-email" name="email" type="email" autoComplete="email" required maxLength={160} placeholder="twoj@email.pl" value={email} disabled={state === 'sending'} aria-invalid={invalid === 'email'} aria-describedby={invalid === 'email' ? 'presale-status' : undefined} onChange={e => { setEmail(e.target.value); setInvalid(null) }} />
        <div className="presale-form__trap" aria-hidden="true"><label>Strona internetowa<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label></div>
        <label className="presale-form__consent"><input ref={consentRef} id="presale-consent" type="checkbox" required checked={consent} disabled={state === 'sending'} aria-invalid={invalid === 'consent'} aria-describedby={invalid === 'consent' ? 'presale-status' : undefined} onChange={e => { setConsent(e.target.checked); setInvalid(null) }} /><span>Chcę otrzymać od X-SMART DEVELOP sp. z o.o. e-mail o rozpoczęciu przedsprzedaży Domów na Polnej i warunkach promocji. Zgodę mogę wycofać w każdej chwili, pisząc na <a href={data.contact.emailHref}>{data.contact.email}</a>.</span></label>
        <button type="submit" className="button button--olive" disabled={state === 'sending'}>{state === 'sending' ? 'Zapisuję…' : 'Powiadom mnie o przedsprzedaży'} <ArrowRight size={17} /></button>
        <p className="presale-form__privacy">Jak przetwarzamy Twój adres? <a href="/polityka-prywatnosci/">Polityka prywatności</a>.</p>
        <p ref={statusRef} tabIndex={-1} id="presale-status" className={`presale-form__status presale-form__status--${state}`} role="status" aria-live="polite">{message}</p>
      </form><Unsubscribe /></div>
    </div>
  </section>
}

function Unsubscribe() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const locked = useRef(false)
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (locked.current) return
    locked.current = true; setBusy(true); setMessage('Zapisywanie zmiany…')
    try {
      const response = await fetch('/api/presale.php', { method:'POST', headers:{'Content-Type':'application/json'}, signal:AbortSignal.timeout(15000), body:JSON.stringify({email:email.trim(),action:'unsubscribe'}) })
      const result = await response.json().catch(() => ({ok:false}))
      if (!response.ok || !result.ok) throw new Error(result.message || 'Nie udało się usunąć adresu. Spróbuj ponownie.')
      setMessage(result.preview ? 'Tryb podglądu: nie zmieniono listy zapisów.' : 'Jeżeli adres był na liście przedsprzedaży, został z niej usunięty.'); setEmail('')
    } catch(error) { setMessage(error instanceof TypeError ? 'Brak połączenia. Spróbuj ponownie później.' : error instanceof Error ? error.message : 'Nie udało się usunąć adresu.') }
    finally { locked.current=false; setBusy(false) }
  }
  return <details className="presale-unsubscribe"><summary>Wypisz się z listy</summary><form onSubmit={submit} aria-label="Rezygnacja z powiadomienia" aria-busy={busy}>
    <label htmlFor="unsubscribe-email">Adres e-mail do usunięcia</label><input id="unsubscribe-email" type="email" required maxLength={160} autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} disabled={busy} />
    <button type="submit" className="text-link" disabled={busy}>{busy ? 'Usuwam…' : 'Usuń mnie z listy'}</button><p role="status">{message}</p>
  </form></details>
}
