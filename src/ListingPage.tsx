import { useEffect, useMemo, useState } from "react"
import EventCard from "./EventCard"
import { listings, type ListingId } from "./data"
import { ChevronBackIcon } from "./icons"
import { pressable } from "./ui"

/** Items rendered per step; "הצגת עוד" adds the next batch, so long collections never render all at once. */
const PAGE_SIZE = 10

/* Full vertical listing behind a section's "הצג הכל": one column of the shared event cards, newest batch appended
   below. Reached at "#/events" / "#/retreats". */
export default function ListingPage({ id, onBack }: { id: ListingId; onBack: () => void }) {
  const { title, emptyText, items } = listings[id]
  const all = useMemo(items, [items])
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
        <p className="mt-8 rounded-card bg-surface px-4 py-8 text-center text-body text-ink-muted">{emptyText}</p>
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
