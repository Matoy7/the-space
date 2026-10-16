import { useEffect, useMemo, useState } from "react"
import EventCard from "./EventCard"
import { listings, type ListingId, type SiteEvent } from "./data"
import { defaultFilters, useFiltered, useFilters } from "./filters"
import { ChevronBackIcon } from "./icons"
import { pressable } from "./ui"

/** Items rendered per step; "הצגת עוד" adds the next batch, so long collections never render all at once. */
const PAGE_SIZE = 10

/* Full vertical listing behind a section's "הצג הכל": one column of the shared event cards (narrowed by the site
   filters), each batch appended below. Reached at "#/events" / "#/retreats". */
export default function ListingPage({ id, onBack }: { id: ListingId; onBack: () => void }) {
  const { title, emptyText, items } = listings[id]
  return <EventListPage emptyText={emptyText} filtered items={useMemo(items, [items])} onBack={onBack} title={title} />
}

/**
 * Shared vertical event list page (category listings, an instructor's activities).
 * `filtered`: apply the site filters (category listings); an instructor's own list is always complete.
 */
export function EventListPage({
  title,
  emptyText,
  items,
  filtered = false,
  onBack,
}: {
  title: string
  emptyText: string
  items: SiteEvent[]
  filtered?: boolean
  onBack: () => void
}) {
  const filters = useFilters()
  const filteredItems = useFiltered(items)
  const all = filtered ? filteredItems : items
  const active = filtered && filters.active
  const [visible, setVisible] = useState(PAGE_SIZE)

  useEffect(() => {
    const previous = document.title
    document.title = `${title} · המרחב`
    return () => {
      document.title = previous
    }
  }, [title])

  return (
    <main className="px-4 pt-4 pb-12">
      <div className="flex items-center gap-2">
        <button
          aria-label="חזרה"
          className={`-ms-2 flex size-10 shrink-0 items-center justify-center rounded-control text-ink active:bg-sand ${pressable}`}
          onClick={onBack}
          type="button"
        >
          <ChevronBackIcon />
        </button>
        <h1 className="text-display font-bold text-ink">{title}</h1>
      </div>

      {all.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-card bg-surface px-4 py-8 text-center">
          <p className="text-body text-ink-muted">{active ? "אין תוצאות שמתאימות לבחירה" : emptyText}</p>
          {active && (
            <button
              className={`h-10 rounded-control bg-header-control px-4 text-meta font-semibold text-ink active:bg-line ${pressable}`}
              onClick={() => filters.setFilters(defaultFilters)}
              type="button"
            >
              ניקוי הכל
            </button>
          )}
        </div>
      ) : (
        <>
          <ul aria-label={title} className="mt-4 flex flex-col gap-4">
            {all.slice(0, visible).map((event) => (
              <li key={event.id}>
                <EventCard event={event} size="list" />
              </li>
            ))}
          </ul>
          {visible < all.length && (
            <button
              className={`mt-6 flex h-12 w-full items-center justify-center rounded-control bg-header-control text-body font-semibold text-ink active:bg-line ${pressable}`}
              onClick={() => setVisible((n) => n + PAGE_SIZE)}
              type="button"
            >
              הצגת עוד
            </button>
          )}
        </>
      )}
    </main>
  )
}
