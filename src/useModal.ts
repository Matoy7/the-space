import { useEffect, useRef, type RefObject } from "react"

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Shared modal behaviour for overlays (side drawer, bottom sheet):
 * - locks page scrolling on the root element while open (locking <body> as well would
 *   turn it into a clipped 100%-height scroller and reset the page to the top);
 * - moves focus into the overlay on open and back to the trigger on close.
 */
export function useModal(
  open: boolean,
  initialFocus: RefObject<HTMLElement | null>,
  returnFocusTo: RefObject<HTMLElement | null>,
) {
  const wasOpen = useRef(false)
  useEffect(() => {
    if (open) {
      wasOpen.current = true
      const root = document.documentElement
      const prevOverflow = root.style.overflow
      root.style.overflow = "hidden"
      initialFocus.current?.focus({ preventScroll: true })
      return () => {
        root.style.overflow = prevOverflow
      }
    }
    if (!wasOpen.current) return
    wasOpen.current = false
    returnFocusTo.current?.focus({ preventScroll: true })
  }, [open, initialFocus, returnFocusTo])
}

/** Keeps Tab / Shift+Tab cycling inside `container`. Call from an onKeyDown handler. */
export function trapTab(e: { key: string; shiftKey: boolean; preventDefault: () => void }, container: HTMLElement | null) {
  if (e.key !== "Tab" || !container) return
  const items = [...container.querySelectorAll<HTMLElement>(FOCUSABLE)]
  if (items.length === 0) return
  const first = items[0]
  const last = items[items.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}
