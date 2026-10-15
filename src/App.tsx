import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react"
import EventPage from "./EventPage"
import FavoritesProvider from "./favorites"
import LocationSheet from "./LocationSheet"
import SideDrawer from "./SideDrawer"
import {
  byIds,
  eventHref,
  events,
  featuredIds,
  images,
  selectedRetreatIds,
  upcomingIds,
  type SiteEvent,
} from "./data"
import { BellIcon, ChevronDownIcon, ChevronForwardIcon, MapPinIcon, MenuIcon } from "./icons"
import { DateBadge, FavoriteButton, MetaItem, RegisterButton, SectionHeader, pressable } from "./ui"

const featuredRetreats = byIds(featuredIds)
const eventCards = byIds(upcomingIds)
const selectedRetreats = byIds(selectedRetreatIds)

const AUTOPLAY_MS = 2500
const SWIPE_THRESHOLD_PX = 40

/* Areas that appear in the site's events and retreats, north to south. No location-based filtering exists yet. */
const locations = ["גליל עליון", "גליל מערבי", "תל אביב", "מדבר יהודה", "מצפה רמון"] as const

/* Listed in reading order (right → left in RTL). */
const categories = [
  { name: "יוגה", image: images.yoga, active: true },
  { name: "מדיטציה", image: images.meditation },
  { name: "סדנאות", image: images.workshops },
  { name: "ריטריטים", image: images.retreats },
  { name: "קהילה", image: images.community },
  { name: "וולנס", image: images.wellness },
]

/* ---------- Sections ---------- */

/** Shared header control: 40px, fully rounded, warm-beige surface, 20px ink icon. */
const headerControl = `flex h-10 items-center justify-center rounded-control bg-header-control text-ink active:bg-line ${pressable}`

function AppHeader({
  location,
  locationButtonRef,
  locationOpen,
  menuButtonRef,
  menuOpen,
  onOpenLocation,
  onOpenMenu,
}: {
  location: string
  locationButtonRef: RefObject<HTMLButtonElement | null>
  locationOpen: boolean
  menuButtonRef: RefObject<HTMLButtonElement | null>
  menuOpen: boolean
  onOpenLocation: () => void
  onOpenMenu: () => void
}) {
  return (
    <header className="sticky top-0 z-10 bg-header pt-[env(safe-area-inset-top)]">
      <h1 className="sr-only">המרחב</h1>
      {/* Equal 1fr side columns keep the location centred on the viewport, not just between the buttons. */}
      <div className="grid h-14 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-4">
        <button
          aria-controls="site-drawer"
          aria-expanded={menuOpen}
          aria-haspopup="dialog"
          aria-label="פתח תפריט"
          className={`${headerControl} w-10 justify-self-start`}
          onClick={onOpenMenu}
          ref={menuButtonRef}
          type="button"
        >
          <MenuIcon />
        </button>
        <button
          aria-controls="location-sheet"
          aria-expanded={locationOpen}
          aria-haspopup="dialog"
          aria-label={`מיקום: ${location}. החלפת אזור`}
          className={`${headerControl} gap-2 justify-self-center ps-3 pe-2 text-meta font-semibold whitespace-nowrap`}
          onClick={onOpenLocation}
          ref={locationButtonRef}
          type="button"
        >
          <MapPinIcon />
          <span>{location}</span>
          <ChevronDownIcon className="text-ink-muted" size={16} />
        </button>
        <button aria-label="התראות" className={`${headerControl} w-10 justify-self-end`} type="button">
          <BellIcon />
        </button>
      </div>
    </header>
  )
}

function CategoryStrip() {
  return (
    <nav aria-label="קטגוריות">
      <ul className="flex snap-x gap-4 overflow-x-auto scroll-px-4 px-4 py-1">
        {categories.map((category) => (
          <li className="shrink-0 snap-start" key={category.name}>
            <button
              aria-current={category.active ? "page" : undefined}
              className="group flex w-16 flex-col items-center gap-2"
              type="button"
            >
              <span
                className={`flex size-16 items-center justify-center rounded-full border-2 p-0.5 transition-transform duration-150 group-active:scale-95 ${
                  category.active ? "border-accent" : "border-transparent"
                }`}
              >
                <img
                  alt=""
                  className="size-full rounded-full object-cover"
                  height={56}
                  src={category.image}
                  width={56}
                />
              </span>
              <span
                className={`text-meta whitespace-nowrap ${
                  category.active ? "font-bold text-ink" : "font-medium text-ink-muted"
                }`}
              >
                {category.name}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function FeaturedSlide({
  active,
  event,
  index,
  total,
}: {
  active: boolean
  event: SiteEvent
  index: number
  total: number
}) {
  const { id, image, location, title } = event
  return (
    <article
      aria-hidden={!active}
      aria-label={`${index + 1} מתוך ${total}`}
      aria-roledescription="שקופית"
      className={`absolute inset-0 flex flex-col justify-end p-6 text-white transition-opacity duration-500 ease-out motion-reduce:transition-none ${
        active ? "z-[1] opacity-100" : "pointer-events-none opacity-0"
      }`}
      inert={!active}
      role="group"
    >
      <img
        alt=""
        className="pointer-events-none absolute inset-0 size-full object-cover"
        draggable={false}
        src={image}
      />
      <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <FavoriteButton className="absolute start-4 top-4" id={id} />
      <DateBadge event={event} inset="end-4 top-4" />

      <h2 className="relative text-display font-bold">{title}</h2>
      <div className="relative mt-1 text-meta text-white/90">
        <MetaItem icon={<MapPinIcon size={16} />}>{location}</MetaItem>
      </div>
      <div className="relative mt-4 flex items-center gap-2">
        <RegisterButton event={event} variant="overlay" />
        <a
          className={`inline-flex h-10 shrink-0 items-center gap-1 rounded-control border border-white/50 bg-white/15 ps-4 pe-3 text-meta font-semibold text-white backdrop-blur-sm active:bg-white/25 ${pressable}`}
          href={eventHref(id)}
        >
          לפרטים
          <ChevronForwardIcon size={16} />
        </a>
      </div>
    </article>
  )
}

function FeaturedCarousel() {
  const total = featuredRetreats.length
  const [active, setActive] = useState(0)
  const [interacting, setInteracting] = useState(false)
  const [focused, setFocused] = useState(false)
  const [pageHidden, setPageHidden] = useState(() => typeof document !== "undefined" && document.hidden)
  // Bumped on every manual navigation so the autoplay timer restarts from zero.
  const [timerEpoch, setTimerEpoch] = useState(0)
  const pointerStartX = useRef<number | null>(null)

  useEffect(() => {
    const onVisibility = () => setPageHidden(document.hidden)
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [])

  const paused = interacting || focused || pageHidden
  useEffect(() => {
    if (paused) return
    const timer = window.setTimeout(() => setActive((i) => (i + 1) % total), AUTOPLAY_MS)
    return () => window.clearTimeout(timer)
  }, [active, paused, timerEpoch, total])

  const goTo = (index: number) => {
    setActive(((index % total) + total) % total)
    setTimerEpoch((n) => n + 1)
  }

  const endInteraction = (clientX: number | null) => {
    const startX = pointerStartX.current
    pointerStartX.current = null
    setInteracting(false)
    if (startX === null || clientX === null) return
    const dx = clientX - startX
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return
    // RTL: the next slide sits to the left, so swiping left (dx < 0) advances.
    goTo(dx < 0 ? active + 1 : active - 1)
  }

  return (
    <section
      aria-label="ריטריטים מומלצים"
      aria-roledescription="קרוסלה"
      className="flex flex-col gap-2 px-4"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
      }}
      // Pause for keyboard focus only; a tap also focuses the dot but should not stop autoplay.
      onFocus={(e) => setFocused(e.target.matches(":focus-visible"))}
    >
      <div
        aria-live={paused ? "polite" : "off"}
        className="relative aspect-[5/4] touch-pan-y overflow-hidden rounded-feature bg-hero select-none"
        onPointerCancel={() => endInteraction(null)}
        onPointerDown={(e) => {
          pointerStartX.current = e.clientX
          setInteracting(true)
        }}
        onPointerLeave={(e) => {
          if (pointerStartX.current !== null) endInteraction(e.clientX)
        }}
        onPointerUp={(e) => endInteraction(e.clientX)}
      >
        {featuredRetreats.map((slide, index) => (
          <FeaturedSlide active={index === active} event={slide} index={index} key={slide.id} total={total} />
        ))}
      </div>

      <div className="flex items-center justify-center">
        {featuredRetreats.map((slide, index) => (
          <button
            aria-current={index === active ? "true" : undefined}
            aria-label={`מעבר לשקופית ${index + 1}: ${slide.title}`}
            className="group flex h-10 items-center px-2"
            key={slide.id}
            onClick={() => goTo(index)}
            type="button"
          >
            <span
              className={`block h-1.5 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none ${
                index === active ? "w-6 bg-accent" : "w-2 bg-line group-active:bg-ink-muted"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  )
}

function EventCard({ event }: { event: SiteEvent }) {
  const { id, image, location, title } = event
  return (
    <article className="relative flex w-60 shrink-0 snap-start flex-col overflow-hidden rounded-card border border-line/60 bg-surface shadow-card">
      <div className="relative aspect-[3/2] overflow-hidden bg-sand">
        <img alt="" className="size-full object-cover" src={image} />
      </div>
      <FavoriteButton className="absolute start-2 top-2 z-[1]" id={id} />
      <DateBadge event={event} />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-title font-bold text-ink">
          {/* The ::after overlay makes the whole card the tap target for this link. */}
          <a className="after:absolute after:inset-0 after:content-['']" href={eventHref(id)}>
            {title}
          </a>
        </h3>
        <p className="mt-1 text-meta text-ink-muted">{location}</p>
        <div className="mt-auto pt-4">
          <div className="border-t border-line pt-4">
            <RegisterButton className="w-full" event={event} />
          </div>
        </div>
      </div>
    </article>
  )
}

/* Horizontal card rail (events, retreats): native RTL scrolling with snap; the next card peeks in. */
const cardRail = "flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-px-4 px-4 pb-2"

/* Sticky header (56px) + 8px breathing room when jumping to a section via an anchor. */
const anchorOffset = "scroll-mt-[calc(env(safe-area-inset-top)+64px)]"

function UpcomingEvents() {
  return (
    <section className={`flex flex-col gap-4 ${anchorOffset}`} id="events">
      <SectionHeader title="אירועים קרובים" />
      <div className={cardRail}>
        {eventCards.map((event) => (
          <EventCard event={event} key={event.id} />
        ))}
      </div>
    </section>
  )
}

function RetreatCard({ event }: { event: SiteEvent }) {
  const { id, image, location, subtitle, title } = event
  return (
    <article className="relative flex w-[82vw] max-w-[340px] shrink-0 overflow-hidden rounded-card border border-line/60 bg-surface shadow-card">
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <h3 className="text-title font-bold text-ink">
          {/* The ::after overlay makes the whole card the tap target for this link. */}
          <a className="after:absolute after:inset-0 after:content-['']" href={eventHref(id)}>
            {title}
          </a>
        </h3>
        {subtitle && <p className="mt-1 text-meta text-ink-muted">{subtitle}</p>}
        <div className="mt-4 text-meta text-ink-muted">
          <MetaItem icon={<MapPinIcon size={16} />}>{location}</MetaItem>
        </div>
        <div className="mt-auto pt-4">
          <RegisterButton event={event} />
        </div>
      </div>
      <div className="relative w-[42%] shrink-0 bg-sand">
        <img alt="" className="size-full object-cover" draggable={false} src={image} />
        <DateBadge event={event} />
      </div>
    </article>
  )
}

function FeaturedRetreats() {
  return (
    <section className={`flex flex-col gap-4 ${anchorOffset}`} id="retreats">
      <SectionHeader title="ריטריטים נבחרים" />
      <div aria-label="ריטריטים נבחרים" className={cardRail} role="list">
        {selectedRetreats.map((event) => (
          <div className="flex shrink-0 snap-start" key={event.id} role="listitem">
            <RetreatCard event={event} />
          </div>
        ))}
      </div>
    </section>
  )
}

function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="rounded-t-feature bg-sand px-4 pt-8 pb-[calc(env(safe-area-inset-bottom)+24px)]">
      <img alt="המרחב" className="h-10 w-auto" height={40} src={images.logo} width={121} />
      <p className="mt-4 max-w-[34ch] text-meta text-ink-muted">
        אירועי וולנס, סדנאות וריטריטים מכל הארץ, מרוכזים במקום אחד — כדי שיהיה קל למצוא את מה שמתאים לכם.
      </p>
      <p className="mt-6 border-t border-ink/10 pt-6 text-meta text-ink-muted">© {year} המרחב. כל הזכויות שמורות.</p>
    </footer>
  )
}

/* Hash routes keep deep links working on GitHub Pages: "#/event/<id>" is an event page; any other hash is the home page. */
type Route = { name: "home" } | { name: "event"; id: string }

function parseRoute(hash: string): Route {
  const match = hash.match(/^#\/event\/([\w-]+)$/)
  return match && events[match[1]] ? { name: "event", id: match[1] } : { name: "home" }
}

function useRoute() {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash))
  const routeRef = useRef(route)
  const homeScrollY = useRef(0)
  // True when the current event page was opened from the home page in this session, so "back" can use history.
  const openedFromHome = useRef(false)

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual"
    const onHashChange = () => {
      const next = parseRoute(window.location.hash)
      const prev = routeRef.current
      if (prev.name === "home" && next.name === "event") {
        homeScrollY.current = window.scrollY
        openedFromHome.current = true
      }
      routeRef.current = next
      setRoute(next)
    }
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  // Event pages open at the top; returning home restores the previous position (or jumps to a section anchor).
  useLayoutEffect(() => {
    if (route.name === "event") {
      window.scrollTo({ top: 0, behavior: "instant" })
      return
    }
    const anchor = window.location.hash.slice(1)
    const target = anchor ? document.getElementById(anchor) : null
    if (target) target.scrollIntoView({ block: "start", behavior: "instant" })
    else window.scrollTo({ top: homeScrollY.current, behavior: "instant" })
  }, [route])

  const goHome = () => {
    if (openedFromHome.current) {
      openedFromHome.current = false
      history.back()
      return
    }
    history.replaceState(null, "", window.location.pathname + window.location.search)
    routeRef.current = { name: "home" }
    homeScrollY.current = 0
    setRoute({ name: "home" })
  }

  return { route, goHome }
}

function HomePage({ location, setLocation }: { location: string; setLocation: (next: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const [locationOpen, setLocationOpen] = useState(false)
  const locationButtonRef = useRef<HTMLButtonElement>(null)
  return (
    <div className="min-h-full bg-canvas">
      <AppHeader
        location={location}
        locationButtonRef={locationButtonRef}
        locationOpen={locationOpen}
        menuButtonRef={menuButtonRef}
        menuOpen={menuOpen}
        onOpenLocation={() => setLocationOpen(true)}
        onOpenMenu={() => setMenuOpen(true)}
      />
      <main className="flex flex-col gap-8 pt-2 pb-8">
        <CategoryStrip />
        <FeaturedCarousel />
        <UpcomingEvents />
        <FeaturedRetreats />
      </main>
      <SiteFooter />
      <SideDrawer onClose={() => setMenuOpen(false)} open={menuOpen} returnFocusTo={menuButtonRef} />
      <LocationSheet
        locations={locations}
        onClose={() => setLocationOpen(false)}
        onConfirm={(next) => {
          setLocation(next)
          setLocationOpen(false)
        }}
        open={locationOpen}
        returnFocusTo={locationButtonRef}
        selected={location}
      />
    </div>
  )
}

function App() {
  const { route, goHome } = useRoute()
  // Lives above the router so the chosen area survives a visit to an event page.
  const [location, setLocation] = useState<string>("תל אביב")
  return (
    <FavoritesProvider>
      {route.name === "event" ? (
        <EventPage event={events[route.id]} key={route.id} onBack={goHome} />
      ) : (
        <HomePage location={location} setLocation={setLocation} />
      )}
    </FavoritesProvider>
  )
}

export default App
