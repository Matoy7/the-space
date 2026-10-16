import { useEffect, useMemo } from "react"
import EventCard from "./EventCard"
import { eventsByHost, hostEventsHref, images, type Host } from "./data"
import { byNextDate } from "./filters"
import { CalendarIcon, GlobeIcon, InstagramIcon, MapPinIcon, WhatsAppIcon } from "./icons"
import { SectionHeader, pressable } from "./ui"

/** Upcoming activities shown on the profile; the full list is one tap away. */
const PREVIEW_COUNT = 3

/** Absolute http(s) URL or null, so a malformed value never becomes a broken link. */
function safeUrl(value: string | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null
  } catch {
    return null
  }
}

type ContactLink = { label: string; Icon: typeof GlobeIcon; href: string }

/** Contact icons, only for the links this instructor actually has. */
function contactLinks(host: Host): ContactLink[] {
  const digits = host.whatsapp?.replace(/\D/g, "") ?? ""
  const links: { label: string; Icon: typeof GlobeIcon; href: string | null }[] = [
    { label: "וואטסאפ", Icon: WhatsAppIcon, href: digits.length >= 8 ? `https://wa.me/${digits}` : null },
    { label: "אתר", Icon: GlobeIcon, href: safeUrl(host.website) },
    { label: "אינסטגרם", Icon: InstagramIcon, href: safeUrl(host.instagram) },
  ]
  return links.filter((l): l is ContactLink => l.href !== null)
}

/* Instructor profile ("#/host/<id>"), laid out after the approved reference: wide photo, portrait across the panel
   edge, name / expertise / area, actions, "עליי", upcoming activities. Everything comes from the instructor's data
   and their events. */
export default function HostPage({ host }: { host: Host }) {
  const activities = useMemo(() => byNextDate(eventsByHost(host.id)), [host.id])
  const areas = [...new Set(activities.map((e) => e.area))].join(" · ")
  const cover = host.cover ?? activities[0]?.image ?? images.retreats
  const contacts = contactLinks(host)
  const allHref = hostEventsHref(host.id)

  useEffect(() => {
    const previous = document.title
    document.title = `${host.name} · המרחב`
    return () => {
      document.title = previous
    }
  }, [host.name])

  return (
    // The panel fills the rest of the screen below the 56px header, so short profiles don't end in a band of canvas.
    <main className="flex min-h-[calc(100dvh-56px-env(safe-area-inset-top))] flex-col">
      <div className="h-48 shrink-0 bg-sand">
        <img alt="" className="size-full object-cover" src={cover} />
      </div>

      {/* The panel rises over the photo's lower edge; the portrait sits across that edge. */}
      <div className="relative -mt-6 flex-1 rounded-t-feature bg-surface pb-12">
        <div className="flex flex-col items-center px-6 text-center">
          {host.photo ? (
            <img
              alt={host.name}
              className="-mt-14 size-28 rounded-full border-4 border-surface object-cover shadow-card"
              src={host.photo}
            />
          ) : (
            <span
              aria-hidden="true"
              className="-mt-14 flex size-28 items-center justify-center rounded-full border-4 border-surface bg-header-control text-page-title font-bold text-ink shadow-card"
            >
              {host.name.trim().charAt(0)}
            </span>
          )}
          <h1 className="mt-4 text-headline font-bold text-ink">{host.name}</h1>
          {host.bio && <p className="mt-1 text-title text-ink-muted">{host.bio}</p>}
          {areas && (
            <p className="mt-2 flex items-center gap-1 text-body text-ink">
              <MapPinIcon className="text-ink-muted" size={18} />
              {areas}
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 px-6">
          {activities.length > 0 && (
            <a
              className={`flex h-12 shrink-0 items-center gap-2 rounded-control bg-accent px-6 text-title font-semibold text-white shadow-card active:bg-accent-pressed ${pressable}`}
              href={allHref}
            >
              <CalendarIcon />
              כל האירועים
            </a>
          )}
          {contacts.length > 0 && (
            <ul aria-label="יצירת קשר" className="flex gap-3">
              {contacts.map(({ label, Icon, href }) => (
                <li key={label}>
                  <a
                    aria-label={`${label}: ${host.name}`}
                    className={`flex size-11 items-center justify-center rounded-full bg-header-control text-accent active:bg-line ${pressable}`}
                    href={href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Icon size={22} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {host.about && (
          <section aria-labelledby="host-about" className="mt-8 px-6">
            <h2 className="text-heading font-bold text-ink" id="host-about">
              עליי
            </h2>
            <p className="mt-2 text-body leading-7 text-ink">{host.about}</p>
          </section>
        )}

        <section aria-labelledby="host-upcoming" className="mt-8">
          {activities.length > 0 ? (
            <>
              <SectionHeader actionHref={allHref} className="px-6" id="host-upcoming" title="אירועים קרובים" />
              <ul className="mt-4 flex flex-col gap-4 px-4">
                {activities.slice(0, PREVIEW_COUNT).map((event) => (
                  <li key={event.id}>
                    <EventCard event={event} size="row" />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="px-6">
              <h2 className="text-heading font-bold text-ink" id="host-upcoming">
                אירועים קרובים
              </h2>
              <p className="mt-4 rounded-card bg-canvas px-4 py-6 text-center text-meta text-ink-muted">
                אין כרגע אירועים קרובים
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
