import { useCallback, useEffect, useRef } from 'react'

/** One history entry per viewer; Android Back consumes it without leaving the page. */
export function useOverlayHistory(onClose: () => void) {
  const callback = useRef(onClose)
  callback.current = onClose
  const token = useRef(`viewer-${crypto.randomUUID()}`)
  useEffect(() => {
    if (window.history.state?.dnpViewer !== token.current) {
      window.history.pushState({ ...window.history.state, dnpViewer: token.current }, '', window.location.href)
    }
    const onPop = () => { if (window.history.state?.dnpViewer !== token.current) callback.current() }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  return useCallback(() => {
    if (window.history.state?.dnpViewer === token.current) window.history.back()
    else callback.current()
  }, [])
}
