import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { fallbackSiteData } from './fallback'
import { demoAdminAllowed } from './demoMode'
import { parseSiteData, resolveSiteDocuments } from './siteSchema.mjs'
import type { SiteData } from './types'

export const PUBLISHED_DATA_KEY = 'dnp-published-site-data-v1'
export const SITE_DATA_EVENT = 'dnp-site-data-published'
export const SITE_DATA_URL = `${import.meta.env.BASE_URL}data/site-data.json`
type Source = 'fallback' | 'production' | 'demo-published'
type SiteDataContextValue = { data: SiteData; source: Source; error: string | null; loading: boolean }
const SiteDataContext = createContext<SiteDataContextValue>({ data: resolveSiteDocuments(fallbackSiteData), source: 'fallback', error: null, loading: true })

function readDemoPublished(): SiteData | null {
  if (!demoAdminAllowed()) return null
  try {
    const raw = localStorage.getItem(PUBLISHED_DATA_KEY)
    return raw ? parseSiteData(JSON.parse(raw)) : null
  } catch { return null }
}

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [production, setProduction] = useState<SiteData>(fallbackSiteData)
  const [demo, setDemo] = useState<SiteData | null>(() => readDemoPublished())
  const [source, setSource] = useState<Source>('fallback')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    let controller: AbortController | null = null
    let lastAttempt = 0
    let pending = false
    const refresh = async () => {
      if (pending) return
      lastAttempt = Date.now()
      pending = true
      controller = new AbortController()
      const timer = window.setTimeout(() => controller?.abort(), 8000)
      try {
        const response = await fetch(SITE_DATA_URL, { cache: 'no-cache', signal: controller.signal })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = parseSiteData(await response.json())
        if (!alive) return
        setProduction(data)
        setSource('production')
        setError(null)
      } catch (reason) {
        if (!alive) return
        // Do not replace a working snapshot with a broken or stale server response.
        setError('Nie udało się potwierdzić aktualności oferty. Ceny i dostępność potwierdź w biurze sprzedaży.')
        console.warn('[Dane strony]', reason instanceof Error ? reason.message : 'Błąd danych')
      } finally {
        clearTimeout(timer)
        pending = false
        if (alive) setLoading(false)
      }
    }
    const refreshOnFocus = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastAttempt > 60_000) void refresh()
    }
    void refresh()
    window.addEventListener('focus', refreshOnFocus)
    document.addEventListener('visibilitychange', refreshOnFocus)
    return () => {
      alive = false
      controller?.abort()
      window.removeEventListener('focus', refreshOnFocus)
      document.removeEventListener('visibilitychange', refreshOnFocus)
    }
  }, [])

  useEffect(() => {
    if (!demoAdminAllowed()) return
    const refresh = () => setDemo(readDemoPublished())
    window.addEventListener('storage', refresh)
    window.addEventListener(SITE_DATA_EVENT, refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener(SITE_DATA_EVENT, refresh)
    }
  }, [])

  const value = useMemo<SiteDataContextValue>(() => ({
    data: resolveSiteDocuments(demo ?? production), source: demo ? 'demo-published' : source,
    error: demo ? null : error, loading,
  }), [demo, production, source, error, loading])
  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>
}
export const useSiteData = () => useContext(SiteDataContext)
