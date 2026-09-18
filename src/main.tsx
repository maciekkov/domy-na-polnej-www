import './styles/fonts'
import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app/App'
import { demoAdminAllowed } from './data/runtime/demoMode'
import { SiteDataProvider, useSiteData } from './data/runtime/SiteDataProvider'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import { CookiePolicy } from './pages/CookiePolicy'
import { NotFound } from './pages/NotFound'
import './styles/site.css'
// Vite removes this branch, the demo store, sample leads and admin CSS in production.
const DemoAdmin = import.meta.env.DEV
  ? lazy(() => import('./admin/AdminApp').then((module) => ({ default: module.AdminApp })))
  : null

const route = window.location.pathname.replace(/\/+$/, '') || '/'

function RoutedApp() {
  const { data } = useSiteData()
  if (route === '/') return <App />
  if (route === '/polityka-prywatnosci') return <PrivacyPolicy contact={data.contact} />
  if (route === '/polityka-cookies') return <CookiePolicy contact={data.contact} />
  if (demoAdminAllowed() && DemoAdmin && (route === '/administrator' || route === '/administracja')) return <Suspense fallback={<p>Ładowanie panelu demo…</p>}><DemoAdmin /></Suspense>
  return <NotFound />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SiteDataProvider><RoutedApp /></SiteDataProvider>
  </React.StrictMode>,
)
