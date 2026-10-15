import { badgeLabel, eventHref, priceLabel, type SiteEvent } from "./data"
import { CalendarIcon } from "./icons"
import { RegisterButton } from "./ui"

/* The one event card used everywhere (carousel, events, retreats, related events), following the approved reference:
   clean photo → [date · time | price] row → title → muted location → divider → registration button. */

type CardSize = "featured" | "rail" | "wide" | "compact"

const sizes: Record<CardSize, { card: string; body: string; title: string; showTime: boolean }> = {
  featured: { card: "w-full", body: "p-5", title: "text-display", showTime: true },
  rail: { card: "w-60 shrink-0 snap-start", body: "p-4", title: "text-title", showTime: true },
  wide: { card: "w-[82vw] max-w-[340px] shrink-0 snap-start", body: "p-4", title: "text-title", showTime: true },
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
  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-card border border-line/60 bg-surface shadow-card ${s.card}`}
    >
      <div className="aspect-[3/2] bg-sand">
        <img alt="" className="size-full object-cover" draggable={false} src={event.image} />
      </div>
      <div className={`flex flex-1 flex-col ${s.body}`}>
        {/* RTL: date on the right, price on the left. */}
        <div className={`flex flex-wrap items-center justify-between ${size === "compact" ? "gap-1" : "gap-2"}`}>
          <EventDate event={event} showTime={s.showTime} />
          <PricePill compact={size === "compact"} event={event} />
        </div>
        <h3 className={`mt-3 font-bold text-ink ${s.title}`}>
          {/* The ::after overlay makes the whole card the tap target for this link. */}
          <a className="after:absolute after:inset-0 after:content-['']" href={eventHref(event.id)}>
            {event.title}
          </a>
        </h3>
        <p className="mt-1 text-meta text-ink-muted">{event.location}</p>
        <div className="mt-auto pt-4">
          <div className="border-t border-line pt-4">
            <RegisterButton className="w-full" event={event} />
          </div>
        </div>
      </div>
    </article>
  )
}
