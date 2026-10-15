import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { badgeLabel, eventHref, priceLabel, relatedEvents, sharePath, splitLocation, type Host, type SiteEvent } from "./data"
import { formatEventDates } from "./dates"
import { CalendarIcon, ChevronBackIcon, ChevronForwardIcon, MapPinIcon, ShareIcon, TagIcon } from "./icons"
import { DateBadge, FavoriteButton, PriceTag, RegisterButton, SectionHeader, pressable } from "./ui"

/* Composition follows the approved reference (390px): 183px of photo above a sheet with 24px rounded corners,
   ~58px detail rows with 40px icon circles, a small-card rail, and a fixed registration bar. The reference is laid
   out left-to-right; rows, section headers and the bar are mirrored here so Hebrew reads from the right. */

const heroControl = `flex size-10 items-center justify-center rounded-control bg-white/90 text-ink shadow-sm backdrop-blur-sm active:bg-white ${pressable}`

function DetailRow({ icon, primary, secondary, action }: { icon: ReactNode; primary: string; secondary?: string; action?: ReactNode }) {
  return (
    <li className="flex min-h-[58px] items-center gap-4 py-2">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-header-control text-ink">{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-title font-bold text-ink">{primary}</span>
        {secondary && <span className="text-meta text-ink-muted">{secondary}</span>}
      </span>
      {action}
    </li>
  )
}

function RelatedCard({ event, showArea }: { event: SiteEvent; showArea: boolean }) {
  return (
    <article className="relative flex w-40 shrink-0 snap-start flex-col overflow-hidden rounded-card border border-line/60 bg-surface shadow-card">
      <div className="relative aspect-[3/2] bg-sand">
        <img alt="" className="size-full object-cover" draggable={false} src={event.image} />
        <DateBadge event={event} />
      </div>
      <FavoriteButton className="absolute start-2 top-2 z-[1]" id={event.id} tone="compact" />
      <div className="flex flex-1 flex-col px-3 pt-2 pb-3">
        <h3 className="truncate text-body font-bold text-ink">
          <a className="after:absolute after:inset-0 after:content-['']" href={eventHref(event.id)}>
            {event.title}
          </a>
        </h3>
        {/* Inside "עוד ב<area>" the area is implied; the date is on the photo. */}
        {showArea && <p className="truncate text-meta text-ink-muted">{event.area}</p>}
        <div className="mt-auto pt-2">
          <PriceTag className="mb-2 block" event={event} />
          <RegisterButton className="w-full" event={event} />
        </div>
      </div>
    </article>
  )
}

/** Short summary clamped to three lines; "להמשך קריאה" appears only when the text is actually cut off. */
function About({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const [overflows, setOverflows] = useState(false)
  const ref = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || expanded) return
    const measure = () => setOverflows(el.scrollHeight > el.clientHeight + 1)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [text, expanded])

  return (
    <section className="border-t border-ink/10 py-6">
      <h2 className="text-title font-bold text-ink">על האירוע</h2>
      <p className={`mt-2 text-body text-ink ${expanded ? "" : "line-clamp-3"}`} id="event-about" ref={ref}>
        {text}
      </p>
      {(overflows || expanded) && (
        <button
          aria-controls="event-about"
          aria-expanded={expanded}
          className="-ms-2 mt-1 inline-flex h-10 items-center gap-1 rounded-control px-2 text-meta font-semibold text-accent active:bg-sand"
          onClick={() => setExpanded((v) => !v)}
          type="button"
        >
          {expanded ? "הצגת פחות" : "להמשך קריאה"}
          <ChevronForwardIcon size={16} />
        </button>
      )}
    </section>
  )
}

function HostRow({ host }: { host: Host }) {
  return (
    <section aria-label="מדריך האירוע" className="flex items-center gap-4 border-t border-ink/10 py-6">
      {host.photo ? (
        <img alt="" className="size-14 shrink-0 rounded-full object-cover" src={host.photo} />
      ) : (
        <span
          aria-hidden="true"
          className="flex size-14 shrink-0 items-center justify-center rounded-full bg-header-control text-heading font-bold text-ink"
        >
          {host.name.trim().charAt(0)}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <h2 className="text-body font-bold text-ink">
          {host.role}: {host.name}
        </h2>
        {host.bio && <p className="text-meta text-ink-muted">{host.bio}</p>}
      </div>
    </section>
  )
}

export default function EventPage({ event, onBack }: { event: SiteEvent; onBack: () => void }) {
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)
  const location = splitLocation(event.location)
  const longDate = formatEventDates(event.dates, "long")
  const shortDate = badgeLabel(event)
  // A fixed card price is used on the page too when no range is given.
  const priceText = event.priceRange ?? priceLabel(event)
  const related = relatedEvents(event)
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`

  useEffect(() => {
    const previous = document.title
    document.title = `${event.title} · המרחב`
    return () => {
      document.title = previous
    }
  }, [event.title])

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  const showToast = (message: string) => {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2200)
  }

  const share = async () => {
    // Share the event's static share page: unlike the #/event/ route, crawlers (WhatsApp, Facebook) can read its preview tags.
    const url = new URL(`${import.meta.env.BASE_URL}${sharePath(event.id)}`, window.location.origin).href
    try {
      if (navigator.share) {
        await navigator.share({ title: event.title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      showToast("הקישור הועתק")
    } catch (error) {
      if ((error as DOMException)?.name !== "AbortError") showToast("לא ניתן לשתף כרגע")
    }
  }

  return (
    <div className="min-h-full bg-surface pb-[calc(env(safe-area-inset-bottom)+96px)]">
      <div className="relative h-[207px] overflow-hidden bg-hero">
        <img alt="" className="size-full object-cover" src={event.image} />
        <div className="absolute inset-x-4 top-[calc(env(safe-area-inset-top)+16px)] flex items-start justify-between">
          <button aria-label="חזרה" className={heroControl} onClick={onBack} type="button">
            <ChevronBackIcon />
          </button>
          <div className="flex gap-2">
            <button aria-label="שיתוף" className={heroControl} onClick={share} type="button">
              <ShareIcon />
            </button>
            <FavoriteButton id={event.id} tone="light" />
          </div>
        </div>
      </div>

      <main className="relative -mt-6 rounded-t-feature bg-surface px-4 pt-4">
        <h1 className="text-center text-headline font-bold text-ink">{event.title}</h1>
        {event.subtitle && <p className="mt-1 text-center text-body text-ink-muted">{event.subtitle}</p>}

        <ul className="mt-4 divide-y divide-ink/10">
          {longDate && <DetailRow icon={<CalendarIcon />} primary={longDate} secondary={event.time} />}
          <DetailRow
            action={
              <a
                className="-me-2 inline-flex h-10 shrink-0 items-center gap-1 rounded-control px-2 text-meta font-semibold text-accent active:bg-sand"
                href={mapsUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                הצגת מיקום במפה
                <ChevronForwardIcon size={16} />
              </a>
            }
            icon={<MapPinIcon />}
            primary={location.primary}
            secondary={location.secondary}
          />
          {priceText && <DetailRow icon={<TagIcon />} primary={priceText} secondary="למשתתף" />}
        </ul>

        {event.about && <About text={event.about} />}

        {event.host && <HostRow host={event.host} />}

        <section className="border-t border-ink/10 pt-6 pb-2">
          <SectionHeader
            actionHref="#events"
            actionLabel="צפייה בכל האירועים"
            className=""
            title={related.sameArea ? `עוד ב${event.area}` : "אירועים נוספים"}
          />
          <div className="-mx-4 mt-4 flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain scroll-px-4 px-4 pb-2">
            {related.items.map((item) => (
              <RelatedCard event={item} key={item.id} showArea={!related.sameArea} />
            ))}
          </div>
        </section>
      </main>

      {toast && (
        <p
          className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+96px)] z-30 mx-auto w-fit rounded-control bg-ink px-4 py-2 text-meta text-white"
          role="status"
        >
          {toast}
        </p>
      )}

      <div className="fixed inset-x-0 bottom-0 z-20 rounded-t-feature bg-surface px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+16px)] shadow-[0_-4px_16px_-4px_rgba(45,38,30,0.12)]">
        <div className="flex items-center justify-between gap-4">
          {priceText ? (
            <div className="min-w-0">
              <p className="text-meta text-ink-muted">מחיר למשתתף</p>
              <p className="text-heading font-bold text-ink">{priceText}</p>
            </div>
          ) : shortDate ? (
            <div className="min-w-0">
              <p className="text-meta text-ink-muted">מועד</p>
              <p className="text-title font-bold text-ink">{shortDate}</p>
            </div>
          ) : (
            <span />
          )}
          <RegisterButton event={event} variant="bar" />
        </div>
      </div>
    </div>
  )
}
