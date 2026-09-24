import React from 'react'
import ReactDOM from 'react-dom/client'
import { AdminApp } from './AdminApp'

const root = document.getElementById('admin-root')
if (root?.dataset.serverSession === 'active') {
  ReactDOM.createRoot(root).render(<React.StrictMode><AdminApp serverSession /></React.StrictMode>)
}
