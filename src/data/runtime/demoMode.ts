/** The demo administrator is available only in Vite development on loopback.
 * Production builds tree-shake the panel completely, while localhost works with plain `npm run dev`. */
export const demoAdminAllowed = (): boolean => import.meta.env.DEV
  && ['localhost', '127.0.0.1', '::1', '[::1]'].includes(window.location.hostname)
