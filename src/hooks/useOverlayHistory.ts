import { useCallback, useEffect, useRef, useState } from 'react'

let nextViewerId = 0

/** One history entry per viewer; Android Back consumes it without leaving the page. */
export function useOverlayHistory(onClose: () => void) {
  const callback = useRef(onClose)
  callback.current = onClose
  // History markers only need to be unique within this page. randomUUID is
  // unavailable in some HTTP previews and must not prevent the viewer opening.
  const [token] = useState(() => `viewer-${Date.now().toString(36)}-${++nextViewerId}`)
  useEffect(() => {
    if (window.history.state?.dnpViewer !== token) {
      window.history.pushState({ ...window.history.state, dnpViewer: token }, '', window.location.href)
    }
    const onPop = () => { if (window.history.state?.dnpViewer !== token) callback.current() }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [token])
  return useCallback(() => {
    if (window.history.state?.dnpViewer === token) window.history.back()
    else callback.current()
  }, [token])
}
