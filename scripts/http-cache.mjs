/** Mirror of the Apache policy, used by the local production preview and HTTP tests. */
export function cacheControl(pathname) {
  if (pathname.startsWith('/api/') || /\.(html|json)$/.test(pathname) || pathname === '/') return 'no-store'
  if (/^\/assets\/build\/.+\.(js|css|woff2?)$/.test(pathname)) return 'public, max-age=31536000, immutable'
  return 'public, no-cache, max-age=0, must-revalidate'
}
