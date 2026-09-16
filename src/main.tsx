import '@fontsource/montserrat/500.css'
import '@fontsource/montserrat/600.css'
import '@fontsource/montserrat/700.css'
import '@fontsource/lato/400.css'
import '@fontsource/lato/700.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app/App'
import { AdminApp } from './admin/AdminApp'
import { SiteDataProvider, useSiteData } from './data/runtime/SiteDataProvider'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import { CookiePolicy } from './pages/CookiePolicy'
import { NotFound } from './pages/NotFound'
import './styles/tokens.css'
import './styles/globals.css'
import './styles/motion.css'
import './styles/admin.css'

const route = window.location.pathname.replace(/\/+$/, '') || '/'
const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)

function RoutedApp() {
  const { data } = useSiteData()
  if (route === '/') return <App />
  if (route === '/polityka-prywatnosci') return <PrivacyPolicy contact={data.contact} />
  if (route === '/polityka-cookies') return <CookiePolicy contact={data.contact} />
  if (isLocalHost && (route === '/administrator' || route === '/administracja')) return <AdminApp />
  return <NotFound />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SiteDataProvider><RoutedApp /></SiteDataProvider>
  </React.StrictMode>,
)
