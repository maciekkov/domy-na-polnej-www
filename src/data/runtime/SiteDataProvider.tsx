import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { fallbackSiteData } from './fallback'
import type { SiteData } from './types'

export const PUBLISHED_DATA_KEY = 'dnp-published-site-data-v1'
export const SITE_DATA_EVENT = 'dnp-site-data-published'

type SiteDataContextValue = { data: SiteData; source: 'fallback' | 'demo-published' }
const SiteDataContext = createContext<SiteDataContextValue>({ data: fallbackSiteData, source: 'fallback' })

const demoRuntimeAllowed = () => ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)

function readPublished(): SiteData | null {
  if (!demoRuntimeAllowed()) return null
  try { const value = localStorage.getItem(PUBLISHED_DATA_KEY); return value ? JSON.parse(value) as SiteData : null } catch { return null }
}

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [published, setPublished] = useState<SiteData | null>(() => readPublished())
  useEffect(() => {
    if (!demoRuntimeAllowed()) return
    const refresh = () => setPublished(readPublished())
    window.addEventListener('storage', refresh); window.addEventListener(SITE_DATA_EVENT, refresh)
    return () => { window.removeEventListener('storage', refresh); window.removeEventListener(SITE_DATA_EVENT, refresh) }
  }, [])
  const value = useMemo<SiteDataContextValue>(() => ({ data: published ?? fallbackSiteData, source: published ? 'demo-published' : 'fallback' }), [published])
  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>
}

export const useSiteData = () => useContext(SiteDataContext)
