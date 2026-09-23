import type { ReactNode } from 'react'
import { ArrowLeft, Mail, Phone } from '../components/common/Icons'
import { BrandLogo } from '../components/common/BrandLogo'
import type { ContactData } from '../data/runtime/types'

type Props = {
  title: string
  lead: string
  updated: string
  contact: ContactData
  children: ReactNode
}

export function LegalLayout({ title, lead, updated, contact, children }: Props) {
  return (
    <div className="legal-page">
      <header className="legal-page__header">
        <div className="shell legal-page__header-inner">
          <a href="/" aria-label="Domy na Polnej — strona główna"><BrandLogo tone="light" /></a>
          <a className="legal-page__back" href="/"><ArrowLeft aria-hidden="true" /> Wróć do strony</a>
        </div>
      </header>
      <main className="shell legal-page__main">
        <div className="legal-page__heading">
          <p className="eyebrow">Domy na Polnej</p>
          <h1>{title}</h1>
          <p>{lead}</p>
          <time>Aktualizacja: {updated}</time>
        </div>
        <div className="legal-page__content">{children}</div>
      </main>
      <footer className="legal-page__footer">
        <div className="shell">
          <strong>X-SMART DEVELOP sp. z o.o.</strong>
          <span>ul. Warszawska 58/3, 68-300 Lubsko · KRS 0001091198 · NIP 8943230686 · REGON 527945971</span>
          <div><a href={contact.phoneHref}><Phone aria-hidden="true" />{contact.phoneDisplay}</a><a href={contact.emailHref}><Mail aria-hidden="true" />{contact.email}</a></div>
        </div>
      </footer>
    </div>
  )
}
