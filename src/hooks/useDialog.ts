import { useEffect, useRef, type RefObject } from 'react'
/** One focus lifetime per opened dialog. Changing gallery slides never restores background focus. */
export function useDialog(ref: RefObject<HTMLElement | null>, onClose: () => void) {
  const callback = useRef(onClose)
  callback.current = onClose
  useEffect(() => {
    const panel = ref.current
    if (!panel) return
    const previous = document.activeElement as HTMLElement | null
    const blocked: Array<[HTMLElement, boolean]> = []
    let current: HTMLElement = panel
    while (current.parentElement && current.parentElement !== document.documentElement) {
      for (const sibling of current.parentElement.children) {
        if (sibling !== current && sibling instanceof HTMLElement && !['SCRIPT','STYLE','LINK'].includes(sibling.tagName)) {
          blocked.push([sibling, sibling.inert]); sibling.inert = true
        }
      }
      current = current.parentElement
    }
    const alreadyLocked = document.body.classList.contains('modal-open')
    document.body.classList.add('modal-open')
    const controls = () => [...panel.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),iframe,[tabindex]:not([tabindex="-1"])')].filter(el=>el.tabIndex >= 0 && el.getClientRects().length && !el.closest('[inert],[hidden],[aria-hidden="true"]'))
    const first = panel.querySelector<HTMLElement>('[data-dialog-close]') ?? controls()[0] ?? panel
    first.focus({ preventScroll: true })
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); callback.current(); return }
      if (event.key !== 'Tab') return
      const items = controls(), index = items.indexOf(document.activeElement as HTMLElement)
      if (!items.length) { event.preventDefault(); panel.focus(); return }
      if (event.shiftKey && index <= 0) { event.preventDefault(); items.at(-1)?.focus() }
      else if (!event.shiftKey && (index === items.length - 1 || index < 0)) { event.preventDefault(); items[0].focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      blocked.forEach(([el,inert]) => { el.inert = inert })
      if (!alreadyLocked) document.body.classList.remove('modal-open')
      const restore = previous?.isConnected ? previous : document.getElementById('choose-tour')
      if (restore && !restore.closest('[inert]')) restore.focus({ preventScroll:true })
    }
  }, [ref])
}
