import { useId, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react"
import {
  dateOptions,
  defaultFilters,
  PRICE_MAX,
  PRICE_STEP,
  regions,
  useFilters,
  type Filters,
} from "./filters"
import { CloseIcon } from "./icons"
import { pressable } from "./ui"
import { trapTab, useModal } from "./useModal"

const DISMISS_DISTANCE = 96
const DISMISS_VELOCITY = 0.5 // px per ms

const chip = (selected: boolean) =>
  `flex h-10 items-center rounded-control border px-4 text-meta font-medium whitespace-nowrap transition-colors ${
    selected ? "border-olive bg-olive text-white" : "border-line bg-canvas text-ink active:bg-sand"
  }`

const isoToday = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function Section({ title, id, children }: { title: string; id: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-line pt-6 first:border-t-0 first:pt-0">
      <h3 className="text-title font-semibold text-ink" id={id}>
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  )
}

/**
 * Location, date and price for every event and retreat collection on the site.
 * Choices are a draft until "הצגת התוצאות"; closing any other way keeps the applied filters.
 */
export default function FilterSheet({
  open,
  onClose,
  returnFocusTo,
}: {
  open: boolean
  onClose: () => void
  returnFocusTo: RefObject<HTMLElement | null>
}) {
  const { filters, setFilters } = useFilters()
  const [draft, setDraft] = useState<Filters>(filters)
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const drag = useRef<{ y: number; t: number } | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const id = useId()

  useModal(open, closeRef, returnFocusTo)

  // Each opening starts from the applied filters (an unapplied draft is discarded).
  useLayoutEffect(() => {
    if (!open) return
    setDraft(filters)
    setDragY(0)
  }, [open, filters])

  const update = (patch: Partial<Filters>) => setDraft((d) => ({ ...d, ...patch }))

  const apply = () => {
    setFilters(draft)
    onClose()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation()
      onClose()
      return
    }
    trapTab(e, sheetRef.current)
  }

  /* Swipe down on the top bar to dismiss; the options area keeps its own vertical scrolling. */
  const onDragStart = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return
    drag.current = { y: e.clientY, t: e.timeStamp }
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onDragMove = (e: React.PointerEvent) => {
    if (drag.current) setDragY(Math.max(0, e.clientY - drag.current.y))
  }
  const onDragEnd = (e: React.PointerEvent) => {
    const start = drag.current
    drag.current = null
    setDragging(false)
    if (!start) return
    const dy = Math.max(0, e.clientY - start.y)
    const velocity = dy / Math.max(1, e.timeStamp - start.t)
    if (dy > DISMISS_DISTANCE || (dy > 24 && velocity > DISMISS_VELOCITY)) onClose()
    else setDragY(0)
  }

  const priceLimited = draft.maxPrice < PRICE_MAX

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      inert={!open}
      onKeyDown={onKeyDown}
    >
      <button
        aria-label="סגירה"
        className={`absolute inset-0 size-full cursor-default bg-black/40 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        tabIndex={-1}
        type="button"
      />

      <div
        aria-labelledby={`${id}-title`}
        aria-modal="true"
        className={`absolute inset-x-0 bottom-0 flex h-[75dvh] max-h-[calc(100dvh-env(safe-area-inset-top)-24px)] min-h-[min(480px,calc(100dvh-24px))] flex-col rounded-t-feature bg-surface shadow-card ${
          dragging ? "" : "transition-transform duration-300 ease-out motion-reduce:transition-none"
        }`}
        id="filter-sheet"
        ref={sheetRef}
        role="dialog"
        style={{ transform: open ? `translateY(${dragY}px)` : "translateY(100%)" }}
      >
        <div
          className="shrink-0 cursor-grab touch-none px-6 pt-2 pb-4 select-none"
          onPointerCancel={onDragEnd}
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
        >
          <span aria-hidden="true" className="mx-auto block h-1 w-10 rounded-full bg-ink/15" />
          <div className="mt-2 flex items-center justify-between gap-4">
            <h2 className="text-heading font-bold text-ink" id={`${id}-title`}>
              התאמת תוצאות
            </h2>
            <button
              aria-label="סגירה"
              className={`-me-2 flex size-10 items-center justify-center rounded-control bg-header-control text-ink active:bg-line ${pressable}`}
              onClick={onClose}
              ref={closeRef}
              type="button"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-6 pb-6">
          <Section id={`${id}-loc`} title="מיקום">
            <div aria-labelledby={`${id}-loc`} className="flex flex-wrap gap-2" role="radiogroup">
              {regions.map((r) => (
                <button
                  aria-checked={draft.region === r.id}
                  className={chip(draft.region === r.id)}
                  key={r.id}
                  onClick={() => update({ region: r.id })}
                  role="radio"
                  type="button"
                >
                  {r.label}
                </button>
              ))}
            </div>
          </Section>

          <Section id={`${id}-date`} title="תאריך">
            <div aria-labelledby={`${id}-date`} className="flex flex-wrap gap-2" role="group">
              {dateOptions.map((o) => (
                <button
                  aria-pressed={draft.date === o.id}
                  className={chip(draft.date === o.id)}
                  key={o.id}
                  // Tapping the selected option again clears the date restriction.
                  onClick={() => update({ date: draft.date === o.id ? null : o.id })}
                  type="button"
                >
                  {o.label}
                </button>
              ))}
            </div>
            {draft.date === "custom" && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-2 text-meta font-medium text-ink-muted">
                  מתאריך
                  <input
                    className="h-12 w-full min-w-0 rounded-xl border border-line bg-canvas px-3 text-body text-ink"
                    min={isoToday()}
                    onChange={(e) => update({ from: e.target.value })}
                    type="date"
                    value={draft.from}
                  />
                </label>
                <label className="flex flex-col gap-2 text-meta font-medium text-ink-muted">
                  עד תאריך
                  <input
                    className="h-12 w-full min-w-0 rounded-xl border border-line bg-canvas px-3 text-body text-ink"
                    min={draft.from || isoToday()}
                    onChange={(e) => update({ to: e.target.value })}
                    type="date"
                    value={draft.to}
                  />
                </label>
              </div>
            )}
          </Section>

          <Section id={`${id}-price`} title="מחיר">
            <label className="flex min-h-12 items-center justify-between gap-4">
              <span className="text-body text-ink">פעילויות בחינם בלבד</span>
              <input
                checked={draft.freeOnly}
                className="peer sr-only"
                onChange={(e) => update({ freeOnly: e.target.checked })}
                role="switch"
                type="checkbox"
              />
              <span
                aria-hidden="true"
                className="relative h-7 w-12 shrink-0 rounded-full bg-line transition-colors peer-checked:bg-olive peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-olive after:absolute after:start-0.5 after:top-0.5 after:size-6 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:content-[''] peer-checked:after:-translate-x-5"
              />
            </label>

            <div className={`mt-6 ${draft.freeOnly ? "opacity-40" : ""}`}>
              <div className="flex items-center justify-between gap-4">
                <label className="text-body text-ink" htmlFor={`${id}-max`}>
                  מחיר מקסימלי
                </label>
                <output className="text-body font-bold text-olive-ink" htmlFor={`${id}-max`}>
                  {priceLimited ? `עד ₪${draft.maxPrice.toLocaleString("en-US")}` : "ללא הגבלה"}
                </output>
              </div>
              <input
                aria-valuetext={priceLimited ? `עד ${draft.maxPrice} שקלים` : "ללא הגבלה"}
                className="mt-4 h-8 w-full cursor-pointer accent-olive"
                disabled={draft.freeOnly}
                id={`${id}-max`}
                max={PRICE_MAX}
                min={0}
                onChange={(e) => update({ maxPrice: Number(e.target.value) })}
                step={PRICE_STEP}
                type="range"
                value={draft.maxPrice}
              />
              <div className="mt-1 flex justify-between text-meta text-ink-muted">
                <span>₪0</span>
                <span>₪1,000+</span>
              </div>
            </div>
          </Section>
        </div>

        <div className="flex shrink-0 items-center gap-4 border-t border-line px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
          <button
            className="h-12 shrink-0 rounded-control px-2 text-body font-semibold text-ink underline-offset-4 active:text-accent"
            onClick={() => setDraft(defaultFilters)}
            type="button"
          >
            ניקוי הכל
          </button>
          <button
            className={`flex h-12 flex-1 items-center justify-center rounded-control bg-accent text-body font-semibold text-white active:bg-accent-pressed ${pressable}`}
            onClick={apply}
            type="button"
          >
            הצגת התוצאות
          </button>
        </div>
      </div>
    </div>
  )
}
