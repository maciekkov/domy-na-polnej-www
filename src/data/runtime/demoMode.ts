/** Demo is deliberately opt-in AND limited to Vite development on loopback. */
export const demoAdminAllowed = (): boolean => import.meta.env.DEV
  && import.meta.env.VITE_ENABLE_DEMO_ADMIN === 'true'
  && ['localhost', '127.0.0.1', '::1', '[::1]'].includes(window.location.hostname)
