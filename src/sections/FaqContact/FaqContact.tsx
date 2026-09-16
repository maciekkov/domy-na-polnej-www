import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { faqItems } from '../../data/faq'
import type { HouseId } from '../../data/houses'
import type { ContactData } from '../../data/runtime/types'
import { recordDemoLead } from '../../admin/demoStore'
import { track } from '../../lib/analytics'

type Props = { selectedHouse: HouseId; contact: ContactData }
type FormState = 'idle' | 'sending' | 'success' | 'error'

type ContactFields = {
  house: string
  name: string
  phone: string
  email: string
  message: string
  consentContact: boolean
  consentPrivacy: boolean
  website: string
}

const initialFields = (selectedHouse: HouseId): ContactFields => ({
  house: selectedHouse,
  name: '',
  phone: '',
  email: '',
  message: '',
  consentContact: false,
  consentPrivacy: false,
  website: '',
})

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function FaqContact({ selectedHouse, contact }: Props) {
  const [openFaq, setOpenFaq] = useState('')
  const [fields, setFields] = useState<ContactFields>(() => initialFields(selectedHouse))
  const [formState, setFormState] = useState<FormState>('idle')
  const [formMessage, setFormMessage] = useState('')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    setFields((current) => ({ ...current, house: selectedHouse }))
  }, [selectedHouse])

  const update = <K extends keyof ContactFields>(key: K, value: ContactFields[K]) => {
    setFields((current) => ({ ...current, [key]: value }))
    if (formState !== 'idle') {
      setFormState('idle')
      setFormMessage('')
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormState('sending')
    setFormMessage('')

    const phoneDigits = fields.phone.replace(/\D/g, '')
    const email = fields.email.trim()
    if (fields.name.trim().length < 2 || phoneDigits.length < 7 || !fields.consentContact || !fields.consentPrivacy) {
      setFormState('error')
      setFormMessage('Uzupełnij imię i telefon oraz zaznacz wymagane zgody.')
      return
    }
    if (email && !emailPattern.test(email)) {
      setFormState('error')
      setFormMessage('Podaj poprawny adres e-mail albo pozostaw to pole puste.')
      return
    }

    try {
      const localPreview = import.meta.env.DEV || ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
      if (localPreview) {
        recordDemoLead({ name: fields.name.trim(), phone: fields.phone.trim(), email, houseCode: fields.house, message: fields.message.trim() })
      } else {
        const response = await fetch('/api/contact.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...fields, email }),
        })
        const result = await response.json().catch(() => ({ ok: false }))
        if (!response.ok || !result.ok) throw new Error(result.message || 'Nie udało się wysłać wiadomości.')
      }
      track('contact_submit', fields.house)
      setFormState('success')
      setFormMessage('Dziękujemy. Wiadomość została przyjęta — skontaktujemy się z Tobą.')
      setFields((current) => ({ ...initialFields(selectedHouse), house: current.house }))
    } catch (error) {
      setFormState('error')
      setFormMessage(error instanceof Error ? error.message : 'Nie udało się wysłać wiadomości. Spróbuj ponownie lub zadzwoń.')
    }
  }

  return (
    <>
      <section id="faq" className="faq-section" aria-labelledby="faq-title">
        <div className="shell faq-section__grid">
          <div className="faq-section__intro">
            <div className="section-kicker"><b>12 / 12</b><span />FAQ + kontakt</div>
            <h2 id="faq-title">Masz pytania?</h2>
            <p>Najważniejsze odpowiedzi o domu, zakupie i finansowaniu — krótko i konkretnie.</p>
          </div>

          <div className="faq-section__columns">
            {[
              { title: 'Inwestycja i dom', ids: ['timeline', 'standard', 'not-included', 'visualisations', 'attic', 'changes'] },
              { title: 'Zakup i formalności', ids: ['formal-status', 'plot', 'reservation', 'handover', 'visit'] },
              { title: 'Cena i bezpieczeństwo', ids: ['price-scope', 'escrow', 'security', 'developer-financing', 'mortgage', 'extra-costs'] },
            ].map((group) => (
              <section className="faq-column" key={group.title} aria-label={group.title}>
                <h3 className="faq-column__title">{group.title}</h3>
                <div className="faq-list" role="list">
                  {group.ids.map((id) => faqItems.find((item) => item.id === id)).filter(Boolean).map((item) => {
                    if (!item) return null
                    const open = item.id === openFaq
                    return (
                      <article className={`faq-item ${open ? 'is-open' : ''}`} key={item.id} role="listitem">
                        <h4>
                          <button type="button" aria-expanded={open} aria-controls={`faq-answer-${item.id}`} onClick={() => setOpenFaq(open ? '' : item.id)}>
                            <span>{item.question}</span><span className="faq-item__symbol" aria-hidden="true">{open ? '−' : '+'}</span>
                          </button>
                        </h4>
                        <div id={`faq-answer-${item.id}`} className="faq-item__answer" hidden={!open}><p>{item.answer}</p></div>
                      </article>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section id="kontakt" className="contact-section" aria-labelledby="contact-title">
        <div className="shell contact-section__grid">
          <div className="contact-section__intro">
            <h2 id="contact-title">Porozmawiajmy<br />o Twoim domu</h2>
            <p>Masz pytania, chcesz umówić się na prezentację działki lub poznać szczegóły oferty? Skontaktuj się z nami — jesteśmy do Twojej dyspozycji.</p>

            <address className="contact-details">
              <a href={contact.phoneHref} onClick={() => track('phone_click')}><Phone aria-hidden="true" /><span><strong>{contact.phoneDisplay}</strong><small>{contact.contactHours}</small></span></a>
              <a href={contact.emailHref} onClick={() => track('email_click')}><Mail aria-hidden="true" /><span><strong>{contact.email}</strong><small>Odpowiadamy zwykle w ciągu 24h</small></span></a>
              <a href={contact.mapHref} target="_blank" rel="noreferrer" onClick={() => track('directions_click')}><MapPin aria-hidden="true" /><span><strong>{contact.addressLine1}</strong><small>{contact.addressLine2}</small><u>Zobacz na mapie →</u></span></a>
            </address>
            <div className="contact-section__botanical" aria-hidden="true"><img src={`${import.meta.env.BASE_URL}assets/images/botanical-corner.svg`} alt="" /></div>
          </div>

          <form className="contact-form" onSubmit={submit} noValidate onFocus={() => { if (!started) { setStarted(true); track('contact_start', fields.house) } }}>
            <h3>Wyślij wiadomość</h3>
            <label className="contact-form__wide">Wybieram dom
              <select value={fields.house} onChange={(event) => update('house', event.target.value)}>
                <option value="A">Dom A</option><option value="B">Dom B</option><option value="C">Dom C</option><option value="D">Dom D</option><option value="E">Dom E</option><option value="unknown">Jeszcze nie wiem</option>
              </select>
            </label>
            <label>Imię <span aria-hidden="true">*</span>
              <input value={fields.name} onChange={(event) => update('name', event.target.value)} autoComplete="name" placeholder="Twoje imię" required />
            </label>
            <label>Telefon <span aria-hidden="true">*</span>
              <input value={fields.phone} onChange={(event) => update('phone', event.target.value)} autoComplete="tel" inputMode="tel" placeholder="+48 123 456 789" required />
            </label>
            <label className="contact-form__wide">E-mail <small>(opcjonalnie)</small>
              <input value={fields.email} onChange={(event) => update('email', event.target.value)} type="email" autoComplete="email" inputMode="email" placeholder="Twój e-mail" />
            </label>
            <label className="contact-form__wide">Wiadomość
              <textarea value={fields.message} onChange={(event) => update('message', event.target.value)} rows={3} placeholder="Napisz, o co chcesz zapytać…" />
            </label>
            <label className="contact-form__honeypot" aria-hidden="true">Strona internetowa<input tabIndex={-1} autoComplete="off" value={fields.website} onChange={(event) => update('website', event.target.value)} /></label>
            <label className="contact-form__consent contact-form__wide"><input type="checkbox" checked={fields.consentContact} onChange={(event) => update('consentContact', event.target.checked)} required /><span>Wyrażam zgodę na kontakt telefoniczny i mailowy w celu przedstawienia oferty Domy na Polnej.</span></label>
            <label className="contact-form__consent contact-form__wide"><input type="checkbox" checked={fields.consentPrivacy} onChange={(event) => update('consentPrivacy', event.target.checked)} required /><span>Zapoznałem/am się z <a href="/polityka-prywatnosci/" target="_blank" rel="noreferrer">polityką prywatności</a>.</span></label>
            <button className="button button--olive contact-form__submit contact-form__wide" type="submit" disabled={formState === 'sending'}>
              {formState === 'sending' ? 'Wysyłanie…' : 'Poproś o kontakt'} <ArrowRight size={17} aria-hidden="true" />
            </button>
            <div className={`contact-form__status contact-form__wide contact-form__status--${formState}`} role="status" aria-live="polite">{formMessage}</div>
          </form>
        </div>
      </section>
    </>
  )
}
