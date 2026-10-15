import { useEffect, useId, useLayoutEffect, useRef, useState, type RefObject } from "react"
import { trapTab, useModal } from "./useModal"

/* Wheel geometry (8-point grid): 48px rows, five visible, selection slot in the middle. */
const ROW = 48
const VISIBLE_ROWS = 5
const EDGE_PAD = ((VISIBLE_ROWS - 1) / 2) * ROW
const SETTLE_MS = 120
const DISMISS_DISTANCE = 96
const DISMISS_VELOCITY = 0.5 // px per ms

/** Visual weight by distance from the centre slot: 24px → 18px → 16px (never below 15px). */
function rowStyle(distance: number) {
  const d = Math.min(distance, 3)
  const scale = d <= 1 ? 1 - 0.25 * d : Math.max(16 / 24, 0.75 - (0.75 - 16 / 24) * (d - 1))
  const opacity = d <= 1 ? 1 - 0.4 * d : Math.max(0.3, 0.6 - 0.3 * (d - 1))
  return { transform: `scale(${scale})`, opacity }
}

export default function LocationSheet({
  locations,
  onClose,
  onConfirm,
  open,
  returnFocusTo,
  selected,
}: {
  locations: readonly string[]
  onClose: () => void
  onConfirm: (location: string) => void
  open: boolean
  returnFocusTo: RefObject<HTMLElement | null>
  selected: string
}) {
  const titleId = useId()
  const sheetRef = useRef<HTMLDivElement>(null)
  const wheelRef = useRef<HTMLUListElement>(null)
  const selectedIndex = Math.max(0, locations.indexOf(selected))
  // `draft` is the highlighted (unconfirmed) choice; `position` is the live, fractional wheel position.
  const [draft, setDraft] = useState(selectedIndex)
  const [position, setPosition] = useState(selectedIndex)
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const settleTimer = useRef<number | undefined>(undefined)
  const frame = useRef<number | undefined>(undefined)
  const tapStartScroll = useRef(0)
  const drag = useRef<{ y: number; t: number } | null>(null)

  useModal(open, wheelRef, returnFocusTo)

  // Every time the sheet opens, start from the confirmed location (an unconfirmed draft is discarded).
  useLayoutEffect(() => {
    if (!open) return
    setDraft(selectedIndex)
    setPosition(selectedIndex)
    setDragY(0)
    if (wheelRef.current) wheelRef.current.scrollTop = selectedIndex * ROW
  }, [open, selectedIndex])

  useEffect(
    () => () => {
      window.clearTimeout(settleTimer.current)
      if (frame.current) cancelAnimationFrame(frame.current)
    },
    [],
  )

  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const scrollToIndex = (index: number) => {
    const i = Math.min(locations.length - 1, Math.max(0, index))
    wheelRef.current?.scrollTo({ top: i * ROW, behavior: reduceMotion() ? "auto" : "smooth" })
  }

  const onWheelScroll = () => {
    const el = wheelRef.current
    if (!el) return
    if (frame.current) cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => setPosition(el.scrollTop / ROW))
    window.clearTimeout(settleTimer.current)
    settleTimer.current = window.setTimeout(() => {
      const i = Math.min(locations.length - 1, Math.max(0, Math.round(el.scrollTop / ROW)))
      setDraft(i)
    }, SETTLE_MS)
  }

  // Read the wheel itself so a confirm tapped right after a flick (before the settle timer) is still correct.
  const confirm = () => {
    const el = wheelRef.current
    const i = el ? Math.min(locations.length - 1, Math.max(0, Math.round(el.scrollTop / ROW))) : draft
    onConfirm(locations[i])
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation()
      onClose()
      return
    }
    trapTab(e, sheetRef.current)
  }

  const onWheelKeyDown = (e: React.KeyboardEvent) => {
    const keys: Record<string, number> = {
      ArrowDown: draft + 1,
      ArrowUp: draft - 1,
      Home: 0,
      End: locations.length - 1,
    }
    if (e.key in keys) {
      e.preventDefault()
      scrollToIndex(keys[e.key])
    } else if (e.key === "Enter") {
      e.preventDefault()
      confirm()
    }
  }

  /* Swipe-down to dismiss, from the handle / title area (the wheel keeps its own vertical scrolling). */
  const onDragStart = (e: React.PointerEvent) => {
    drag.current = { y: e.clientY, t: e.timeStamp }
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onDragMove = (e: React.PointerEvent) => {
    if (!drag.current) return
    setDragY(Math.max(0, e.clientY - drag.current.y))
  }
  const onDragEnd = (e: React.PointerEvent) => {
    const start = drag.current
    drag.current = null
    setDragging(false)
    if (!start) return
    const dy = Math.max(0, e.clientY - start.y)
    const velocity = dy / Math.max(1, e.timeStamp - start.t)
    if (dy > DISMISS_DISTANCE || (dy > 24 && velocity > DISMISS_VELOCITY)) {
      onClose()
    } else {
      setDragY(0)
    }
  }

  const sheetTransform = open ? `translateY(${dragY}px)` : "translateY(100%)"

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      inert={!open}
      onKeyDown={onKeyDown}
    >
      <button
        aria-label="ביטול בחירת אזור"
        className={`absolute inset-0 size-full cursor-default bg-black/40 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        tabIndex={-1}
        type="button"
      />

      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className={`absolute inset-x-0 bottom-0 rounded-t-feature bg-surface pb-[calc(env(safe-area-inset-bottom)+16px)] ${
          dragging ? "" : "transition-transform duration-300 ease-out motion-reduce:transition-none"
        }`}
        id="location-sheet"
        ref={sheetRef}
        role="dialog"
        style={{ transform: sheetTransform }}
      >
        <div
          className="cursor-grab touch-none pt-2 pb-2 select-none"
          data-drag-zone
          onPointerCancel={onDragEnd}
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
        >
          <span aria-hidden="true" className="mx-auto block h-1 w-10 rounded-full bg-ink/15" />
          <h2 className="mt-4 text-center text-title font-semibold text-ink" id={titleId}>
            אזור
          </h2>
        </div>

        <div className="relative mx-6 mt-2" style={{ height: VISIBLE_ROWS * ROW }}>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-control bg-sand/70"
            style={{ height: ROW }}
          />
          <ul
            aria-activedescendant={`${titleId}-opt-${draft}`}
            aria-label="אזורים"
            className="absolute inset-0 snap-y snap-mandatory overflow-y-auto overscroll-contain rounded-card outline-offset-4"
            onKeyDown={onWheelKeyDown}
            onPointerDown={() => {
              tapStartScroll.current = wheelRef.current?.scrollTop ?? 0
            }}
            onScroll={onWheelScroll}
            ref={wheelRef}
            role="listbox"
            style={{ paddingBlock: EDGE_PAD }}
            tabIndex={0}
          >
            {locations.map((name, i) => {
              const distance = Math.abs(i - position)
              const isCentre = distance < 0.5
              return (
                <li
                  aria-selected={i === draft}
                  className="flex snap-center items-center justify-center"
                  id={`${titleId}-opt-${i}`}
                  key={name}
                  onClick={() => {
                    // Ignore taps that were really the end of a scroll/flick.
                    if (Math.abs((wheelRef.current?.scrollTop ?? 0) - tapStartScroll.current) > 4) return
                    scrollToIndex(i)
                  }}
                  role="option"
                  style={{ height: ROW }}
                >
                  <span
                    className={`block text-[24px] leading-8 whitespace-nowrap ${
                      isCentre ? "font-semibold text-ink" : "font-normal text-ink-muted"
                    }`}
                    style={rowStyle(distance)}
                  >
                    {name}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="mx-6 mt-6">
          <button
            className="flex h-12 w-full items-center justify-center rounded-control bg-accent text-body font-semibold text-white transition-[background-color,transform] duration-150 active:scale-[0.98] active:bg-accent-pressed"
            onClick={confirm}
            type="button"
          >
            בחירת אזור
          </button>
        </div>
      </div>
    </div>
  )
}
