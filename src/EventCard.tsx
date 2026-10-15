import { badgeLabel, eventHref, priceLabel, type SiteEvent } from "./data"
import { CalendarIcon, MapPinIcon } from "./icons"

/* The one event card used everywhere (carousel, events, retreats, related events), following the approved reference:
   clean photo → [date · time | price] row → title → muted location. The whole card opens the event page,
   where registration lives. The featured (carousel) card keeps its title and location over the photo. */

type CardSize = "featured" | "rail" | "wide" | "compact" | "list"

const sizes: Record<CardSize, { card: string; body: string; title: string; showTime: boolean }> = {
  featured: { card: "w-full", body: "p-5", title: "text-display", showTime: true },
  rail: { card: "w-60 shrink-0 snap-start", body: "p-4", title: "text-title", showTime: true },
  wide: { card: "w-[82vw] max-w-[340px] shrink-0 snap-start", body: "p-4", title: "text-title", showTime: true },
  // Full-width card of the vertical listing pages.
  list: { card: "w-full", body: "p-4", title: "text-title", showTime: true },
  // 160px cards: no time, so the date and price fit on one row.
  compact: { card: "w-40 shrink-0 snap-start", body: "p-3", title: "text-body", showTime: false },
}

/** Date (and time) with a calendar icon; nothing when the event has no valid date. */
export function EventDate({ event, showTime = true }: { event: SiteEvent; showTime?: boolean }) {
  const label = badgeLabel(event, showTime)
  if (!label) return null
  return (
    <span className="flex min-w-0 items-center gap-2 text-meta font-medium whitespace-nowrap text-ink">
      <CalendarIcon className="text-olive" size={18} />
      <span>{label}</span>
    </span>
  )
}

/** Price pill; nothing when the event has no price. */
export function PricePill({ event, compact = false }: { event: SiteEvent; compact?: boolean }) {
  const label = priceLabel(event)
  if (!label) return null
  return (
    <span
      aria-label={`מחיר: ${label}`}
      className={`flex h-8 shrink-0 items-center rounded-xl bg-olive-soft font-bold whitespace-nowrap text-olive-ink ${
        compact ? "px-2 text-body" : "px-3 text-title"
      }`}
    >
      {label}
    </span>
  )
}

export default function EventCard({ event, size }: { event: SiteEvent; size: CardSize }) {
  const s = sizes[size]
  const featured = size === "featured"
  // The ::after overlay makes the whole card the tap target for this link.
  const link = (
    <a className="after:absolute after:inset-0 after:content-['']" href={eventHref(event.id)}>
      {event.title}
    </a>
  )
  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-card border border-line/60 bg-surface shadow-card ${s.card}`}
    >
      <div className="relative aspect-[3/2] bg-sand">
        <img alt="" className="size-full object-cover" draggable={false} src={event.image} />
        {featured && (
          <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-black/75 via-black/35 to-transparent px-5 pt-16 pb-4 text-white">
            <h3 className={`font-bold ${s.title}`}>{link}</h3>
            <p className="mt-1 flex items-center gap-1 text-meta text-white/90">
              <MapPinIcon size={16} />
              {event.location}
            </p>
          </div>
        )}
      </div>
      <div className={`flex flex-1 flex-col ${s.body}`}>
        {/* RTL: date on the right, price on the left. */}
        <div className={`flex flex-wrap items-center justify-between ${size === "compact" ? "gap-1" : "gap-2"}`}>
          <EventDate event={event} showTime={s.showTime} />
          <PricePill compact={size === "compact"} event={event} />
        </div>
        {!featured && (
          <>
            <h3 className={`mt-3 font-bold text-ink ${s.title}`}>{link}</h3>
            <p className="mt-1 text-meta text-ink-muted">{event.location}</p>
          </>
        )}
      </div>
    </article>
  )
}
