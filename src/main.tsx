import '@fontsource/montserrat/500.css'
import '@fontsource/montserrat/600.css'
import '@fontsource/montserrat/700.css'
import '@fontsource/lato/400.css'
import '@fontsource/lato/700.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app/App'
import { AdminApp } from './admin/AdminApp'
import { SiteDataProvider } from './data/runtime/SiteDataProvider'
import './styles/tokens.css'
import './styles/globals.css'
import './styles/motion.css'
import './styles/admin.css'

const route = window.location.pathname.replace(/\/+$/, '') || '/'
const isAdminRoute = route === '/administrator' || route === '/administracja'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SiteDataProvider>{isAdminRoute ? <AdminApp /> : <App />}</SiteDataProvider>
  </React.StrictMode>,
)
