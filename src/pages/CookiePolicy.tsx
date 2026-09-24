import type { ContactData } from '../data/runtime/types'
import { LegalLayout } from './LegalLayout'
import { legalContent } from '../lib/legalContent.mjs'
export function CookiePolicy({ contact }: { contact: ContactData }) {
  const page=legalContent('cookies',contact)
  return <LegalLayout title={page.title} lead={page.lead} updated={page.updated} contact={contact}>
    {/* Static authored policy; contact substitutions are escaped in the shared module. */}
    <div dangerouslySetInnerHTML={{__html:page.body}} />
  </LegalLayout>
}
