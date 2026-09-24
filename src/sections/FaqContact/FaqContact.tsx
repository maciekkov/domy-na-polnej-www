import { ArrowRight, Mail, MapPin, Phone } from '../../components/common/Icons'
import { useEffect, useState, useRef } from 'react'
import type { FormEvent } from 'react'
import { useSiteData } from '../../data/runtime/SiteDataProvider'
import { faqForStage } from '../../lib/sales.mjs'
import { faqItems } from '../../data/faq'
import { isHouseId, type HouseSelection } from '../../data/houses'
import type { ContactData } from '../../data/runtime/types'
import { demoAdminAllowed } from '../../data/runtime/demoMode'
import { track } from '../../lib/analytics'
import { validateContact, type ContactErrors } from '../../lib/contactValidation.mjs'

type Props = { selectedHouse: HouseSelection; onHouseChange: (value: HouseSelection) => void; contact: ContactData }
type FormState = 'idle' | 'sending' | 'success' | 'error'

type ContactFields = {
  house: HouseSelection
  name: string
  phone: string
  email: string
  message: string
  consentContact: boolean
  consentPrivacy: boolean
  website: string
}

const initialFields = (selectedHouse: HouseSelection): ContactFields => ({
  house: selectedHouse,
  name: '',
  phone: '',
  email: '',
  message: '',
  consentContact: false,
  consentPrivacy: false,
  website: '',
})


export function FaqContact({ selectedHouse, onHouseChange, contact }: Props) {
  const { data } = useSiteData()
  const visibleFaq = faqForStage(data,faqItems)
  const [openFaq, setOpenFaq] = useState('')
  const [fields, setFields] = useState<ContactFields>(() => initialFields(selectedHouse))
  const [formState, setFormState] = useState<FormState>('idle')
  const [formMessage, setFormMessage] = useState('')
  const [started, setStarted] = useState(false)
  const [errors, setErrors] = useState<ContactErrors>({})
  const sending = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)
  const fieldError = (name: keyof ContactErrors) => errors[name] ? <span className="contact-form__field-error" id={`contact-${name}-error`}>{errors[name]}</span> : null
  const fieldA11y = (name: keyof ContactErrors) => ({ id: `contact-${name}`, name, disabled: formState === 'sending', 'aria-invalid': Boolean(errors[name]), 'aria-describedby': errors[name] ? `contact-${name}-error` : undefined })

  useEffect(() => {
    setFields((current) => ({ ...current, house: selectedHouse }))
  }, [selectedHouse])

  const update = <K extends keyof ContactFields>(key: K, value: ContactFields[K]) => {
    setFields((current) => ({ ...current, [key]: value }))
    setErrors(current => { const copy = {...current}; delete copy[key as keyof ContactErrors]; return copy })
    if (formState !== 'idle') {
      setFormState('idle')
      setFormMessage('')
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (sending.current) return
    const validation = validateContact(fields)
    setErrors(validation)
    if (Object.keys(validation).length) {
      setFormState('error')
      setFormMessage('Sprawdź zaznaczone pola formularza.')
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    sending.current = true
    setFormState('sending')
    setFormMessage('Wysyłanie wiadomości…')
    const email = fields.email.trim()

    try {
      let previewOnly = false
      if (import.meta.env.DEV && demoAdminAllowed()) {
        const { recordDemoLead } = await import('../../admin/demoStore')
        previewOnly = true
        recordDemoLead({ name: fields.name.trim(), phone: fields.phone.trim(), email, houseCode: fields.house, message: fields.message.trim() })
      } else {
        const response = await fetch('/api/contact.php', {
          method: 'POST',
          signal: AbortSignal.timeout(25000),
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...fields, email }),
        })
        const result = await response.json().catch(() => ({ ok: false }))
        if (!response.ok || !result.ok) throw new Error(result.message || 'Nie udało się wysłać wiadomości.')
        previewOnly = result.preview === true
      }
      if (!previewOnly) track('contact_submit', fields.house)
      setFormState('success')
      setFormMessage(previewOnly
        ? 'Tryb podglądu: formularz został sprawdzony, ale wiadomość nie została wysłana do biura.'
        : 'Dziękujemy. Wiadomość została przyjęta — skontaktujemy się z Tobą.')
      setFields((current) => ({ ...initialFields(selectedHouse), house: current.house }))
      setErrors({})
    } catch (error) {
      setFormState('error')
      setFormMessage(error instanceof DOMException && error.name === 'TimeoutError' ? 'Serwer nie odpowiedział na czas. Zadzwoń do biura lub spróbuj ponownie później.' : error instanceof Error ? error.message : 'Nie udało się wysłać wiadomości. Spróbuj ponownie lub zadzwoń.')
    } finally {
      sending.current = false
      requestAnimationFrame(() => statusRef.current?.focus())
    }
  }

  return (
    <>
      <section id="faq" className="faq-section" aria-labelledby="faq-title">
        <div className="shell faq-section__grid">
          <div className="faq-section__intro">
            <div className="section-kicker"><span />FAQ + kontakt</div>
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
                  {group.ids.map((id) => visibleFaq.find((item) => item.id === id)).filter(Boolean).map((item) => {
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
            <p>Zapytaj o wybrany dom, standard lub spotkanie na działce. Zostaw imię i telefon — porozmawiamy o szczegółach.</p>

            <address className="contact-details">
              <a href={contact.phoneHref} onClick={() => track('phone_click')}><Phone aria-hidden="true" /><span><strong>{contact.phoneDisplay}</strong><small>{contact.contactHours}</small></span></a>
              <a href={contact.emailHref} onClick={() => track('email_click')}><Mail aria-hidden="true" /><span><strong>{contact.email}</strong><small>Zapytaj o ofertę i szczegóły domu</small></span></a>
              <a href={contact.mapHref} target="_blank" rel="noreferrer" onClick={() => track('directions_click')}><MapPin aria-hidden="true" /><span><strong>{contact.addressLine1}</strong><small>{contact.addressLine2}</small><u>Zobacz na mapie →</u></span></a>
            </address>
          </div>

          <form ref={formRef} className="contact-form" aria-labelledby="contact-form-title" aria-busy={formState === 'sending'} onSubmit={submit} noValidate onFocus={() => { if (!started && track('contact_start', fields.house)) setStarted(true) }}>
            <h3 id="contact-form-title">Wyślij wiadomość</h3>
            <p className="contact-form__hint contact-form__wide">Pola oznaczone * są wymagane. E-mail i wiadomość są opcjonalne.</p>
            <label className="contact-form__wide"><span>Wybieram dom</span>
              <select name="house" value={fields.house} disabled={formState === 'sending'} onChange={(event) => {
                const value: HouseSelection = isHouseId(event.target.value) ? event.target.value : 'unknown'
                update('house', value)
                onHouseChange(value)
              }}>
                <option value="unknown">Jeszcze nie wybrałem</option><option value="A">Dom A</option><option value="B">Dom B</option><option value="C">Dom C</option><option value="D">Dom D</option><option value="E">Dom E</option>
              </select>
            </label>
            <label><span>Imię <span aria-hidden="true">*</span></span>
              <input {...fieldA11y('name')} value={fields.name} onChange={(event) => update('name', event.target.value)} autoComplete="given-name" placeholder="Twoje imię" maxLength={100} required />{fieldError('name')}
            </label>
            <label><span>Telefon <span aria-hidden="true">*</span></span>
              <input {...fieldA11y('phone')} type="tel" value={fields.phone} onChange={(event) => update('phone', event.target.value)} autoComplete="tel" inputMode="tel" placeholder="+48 123 456 789" maxLength={50} required />{fieldError('phone')}
            </label>
            <label className="contact-form__wide"><span>E-mail <small>(opcjonalnie)</small></span>
              <input {...fieldA11y('email')} value={fields.email} onChange={(event) => update('email', event.target.value)} type="email" autoComplete="email" inputMode="email" placeholder="Twój e-mail" maxLength={160} />{fieldError('email')}
            </label>
            <label className="contact-form__wide"><span>Wiadomość <small>(opcjonalnie)</small></span>
              <textarea {...fieldA11y('message')} value={fields.message} onChange={(event) => update('message', event.target.value)} rows={4} maxLength={3000} placeholder="Napisz, o co chcesz zapytać…" />{fieldError('message')}
            </label>
            <label className="contact-form__honeypot" aria-hidden="true">Strona internetowa<input name="website" tabIndex={-1} autoComplete="off" value={fields.website} onChange={(event) => update('website', event.target.value)} /></label>
            <div className="contact-form__wide"><label className="contact-form__consent"><input {...fieldA11y('consentContact')} type="checkbox" checked={fields.consentContact} onChange={(event) => update('consentContact', event.target.checked)} required /><span>Wyrażam zgodę na kontakt telefoniczny i mailowy w celu przedstawienia oferty Domy na Polnej. *</span></label>{fieldError('consentContact')}</div>
            <div className="contact-form__wide"><label className="contact-form__consent"><input {...fieldA11y('consentPrivacy')} type="checkbox" checked={fields.consentPrivacy} onChange={(event) => update('consentPrivacy', event.target.checked)} required /><span>Zapoznałem/am się z <a href="/polityka-prywatnosci/" target="_blank" rel="noreferrer">polityką prywatności</a>. *</span></label>{fieldError('consentPrivacy')}</div>
            <button className="button button--olive contact-form__submit contact-form__wide" type="submit" disabled={formState === 'sending'}>
              {formState === 'sending' ? 'Wysyłanie…' : 'Poproś o kontakt'} <ArrowRight size={17} aria-hidden="true" />
            </button>
            <div ref={statusRef} tabIndex={-1} className={`contact-form__status contact-form__wide contact-form__status--${formState}`} role={formState === 'error' ? 'alert' : 'status'} aria-live={formState === 'error' ? 'assertive' : 'polite'} aria-atomic="true">{formMessage}</div>
          </form>
        </div>
      </section>
    </>
  )
}
