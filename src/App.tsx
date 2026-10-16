import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react"
import AboutPage from "./AboutPage"
import EventCard from "./EventCard"
import HostPage from "./HostPage"
import ListingPage, { EventListPage } from "./ListingPage"
import ContactPage from "./ContactPage"
import EventPage from "./EventPage"
import FilterSheet, { type FilterKind } from "./FilterSheet"
import { FilterProvider, byNextDate, describe, useFiltered, useFilters } from "./filters"
import SideDrawer from "./SideDrawer"
import {
  byIds,
  eventsByHost,
  hosts,
  listingHref,
  listings,
  type ListingId,
  events,
  featuredIds,
  images,
  selectedRetreatIds,
  upcomingIds,
  type SiteEvent,
} from "./data"
import { BellIcon, CalendarIcon, MenuIcon, MapPinIcon, TagIcon } from "./icons"
import { SectionHeader, pressable } from "./ui"

const featuredRetreats = byIds(featuredIds)
const eventCards = byIds(upcomingIds)
const selectedRetreats = byIds(selectedRetreatIds)

const AUTOPLAY_MS = 2500
const SWIPE_THRESHOLD_PX = 40
const LONG_PRESS_MS = 500


/* Listed in reading order (right → left in RTL). */
const categories = [
  { name: "יוגה", image: images.yoga },
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
  menuButtonRef,
  menuOpen,
  onOpenMenu,
}: {
  menuButtonRef: RefObject<HTMLButtonElement | null>
  menuOpen: boolean
  onOpenMenu: () => void
}) {
  return (
    <header className="sticky top-0 z-10 bg-header pt-[env(safe-area-inset-top)]">
      {/* Equal 1fr side columns keep the logo centred on the viewport, not just between the buttons. */}
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
        {/* Same logo asset and size as the footer. */}
        <h1 className="justify-self-center">
          <img alt="המרחב" className="h-10 w-auto" height={40} src={images.logo} width={121} />
        </h1>
        <button aria-label="התראות" className={`${headerControl} w-10 justify-self-end`} type="button">
          <BellIcon />
        </button>
      </div>
    </header>
  )
}

/** Story-style category circles. Tapping one selects it (single selection). There is no category data on events yet,
    so selection is visual only and does not filter the lists. */
function CategoryStrip({ selected, onSelect }: { selected: string; onSelect: (name: string) => void }) {
  return (
    <nav aria-label="קטגוריות">
      <ul className="flex snap-x gap-4 overflow-x-auto scroll-px-4 px-4 py-1">
        {categories.map((category) => {
          const isSelected = category.name === selected
          return (
            <li className="shrink-0 snap-start" key={category.name}>
              <button
                aria-pressed={isSelected}
                className="group flex w-16 flex-col items-center gap-2"
                onClick={() => onSelect(category.name)}
                type="button"
              >
                <span
                  className={`flex size-16 items-center justify-center rounded-full border-2 p-0.5 transition-[border-color,transform] duration-200 group-active:scale-95 motion-reduce:transition-none ${
                    isSelected ? "border-accent" : "border-transparent"
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
                  className={`text-meta whitespace-nowrap transition-colors duration-200 ${
                    isSelected ? "font-bold text-ink" : "font-medium text-ink-muted"
                  }`}
                >
                  {category.name}
                </span>
              </button>
            </li>
          )
        })}
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
  return (
    <div
      aria-hidden={!active}
      aria-label={`${index + 1} מתוך ${total}`}
      aria-roledescription="שקופית"
      className={`col-start-1 row-start-1 flex transition-opacity duration-500 ease-out motion-reduce:transition-none ${
        active ? "z-[1] opacity-100" : "pointer-events-none opacity-0"
      }`}
      inert={!active}
      role="group"
    >
      <EventCard event={event} size="featured" />
    </div>
  )
}

function FeaturedCarousel({ slides }: { slides: SiteEvent[] }) {
  const total = slides.length
  const [active, setActive] = useState(0)
  const [interacting, setInteracting] = useState(false)
  const [focused, setFocused] = useState(false)
  const [pageHidden, setPageHidden] = useState(() => typeof document !== "undefined" && document.hidden)
  // Bumped on every manual navigation so the autoplay timer restarts from zero.
  const [timerEpoch, setTimerEpoch] = useState(0)
  const pointerStartX = useRef<number | null>(null)
  // Set when a gesture was a swipe or a press-and-hold (pause), so the click that follows it doesn't open the event.
  const suppressClick = useRef(false)
  const pointerDownAt = useRef(0)

  useEffect(() => {
    const onVisibility = () => setPageHidden(document.hidden)
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [])

  const paused = interacting || focused || pageHidden
  useEffect(() => {
    if (paused || total < 2) return
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
    if (startX !== null && performance.now() - pointerDownAt.current > LONG_PRESS_MS) suppressClick.current = true
    if (startX === null || clientX === null) return
    const dx = clientX - startX
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return
    suppressClick.current = true
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
        className="grid touch-pan-y select-none"
        onClickCapture={(e) => {
          if (!suppressClick.current) return
          suppressClick.current = false
          e.preventDefault()
          e.stopPropagation()
        }}
        onPointerCancel={() => endInteraction(null)}
        onPointerDown={(e) => {
          suppressClick.current = false
          pointerDownAt.current = performance.now()
          pointerStartX.current = e.clientX
          setInteracting(true)
        }}
        onPointerLeave={(e) => {
          if (pointerStartX.current !== null) endInteraction(e.clientX)
        }}
        onPointerUp={(e) => endInteraction(e.clientX)}
      >
        {slides.map((slide, index) => (
          <FeaturedSlide active={index === active} event={slide} index={index} key={slide.id} total={total} />
        ))}
      </div>

      <div className={`flex items-center justify-center ${total < 2 ? "hidden" : ""}`}>
        {slides.map((slide, index) => (
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

/* Horizontal card rail (events, retreats): native RTL scrolling with snap; the next card peeks in. */
const cardRail = "flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-px-4 px-4 pb-2"

/* Sticky header (56px) + 8px breathing room when jumping to a section via an anchor. */
const anchorOffset = "scroll-mt-[calc(env(safe-area-inset-top)+64px)]"

/** Shown in a home section when the filters leave it empty (the section's anchor and "הצג הכל" stay). */
function NoResults() {
  return (
    <p className="mx-4 rounded-card bg-surface px-4 py-6 text-center text-meta text-ink-muted">
      אין תוצאות שמתאימות לבחירה
    </p>
  )
}

const filterChips = [
  { kind: "location", Icon: MapPinIcon, name: "מיקום" },
  { kind: "date", Icon: CalendarIcon, name: "תאריך" },
  { kind: "price", Icon: TagIcon, name: "מחיר" },
] as const

/** One chip per filter (location, date, price); each shows its current value and opens its own sheet. */
function FilterChips() {
  const { filters } = useFilters()
  const state = describe(filters)
  const [open, setOpen] = useState<FilterKind | null>(null)
  const lastChip = useRef<HTMLButtonElement | null>(null)
  return (
    // -my-4 trims the page's 32px section gap to 16px on each side of this compact row.
    <div className="-my-4">
      <ul aria-label="סינון" className="flex gap-2 overflow-x-auto overscroll-x-contain px-4">
        {filterChips.map(({ kind, Icon, name }) => {
          const { active, label } = state[kind]
          return (
            <li className="shrink-0" key={kind}>
              <button
                aria-expanded={open === kind}
                aria-haspopup="dialog"
                aria-label={active ? `${name}: ${label}` : name}
                className={`flex h-10 items-center gap-2 rounded-control border px-3 text-meta font-medium whitespace-nowrap ${pressable} ${
                  active ? "border-olive bg-olive-soft text-olive-ink" : "border-line bg-surface text-ink active:bg-sand"
                }`}
                onClick={(e) => {
                  lastChip.current = e.currentTarget
                  setOpen(kind)
                }}
                type="button"
              >
                <Icon className={active ? "text-olive" : "text-ink-muted"} size={16} />
                {label}
              </button>
            </li>
          )
        })}
      </ul>
      <FilterSheet kind={open} onClose={() => setOpen(null)} returnFocusTo={lastChip} />
    </div>
  )
}

function UpcomingEvents() {
  const items = useFiltered(eventCards)
  return (
    <section className={`flex flex-col gap-4 ${anchorOffset}`} id="events">
      <SectionHeader actionHref={listingHref("events")} title="אירועים קרובים" />
      <div className={cardRail}>
        {items.map((event) => (
          <EventCard event={event} key={event.id} size="rail" />
        ))}
      </div>
      {items.length === 0 && <NoResults />}
    </section>
  )
}

function FeaturedRetreats() {
  const items = useFiltered(selectedRetreats)
  return (
    <section className={`flex flex-col gap-4 ${anchorOffset}`} id="retreats">
      <SectionHeader actionHref={listingHref("retreats")} title="ריטריטים נבחרים" />
      <div aria-label="ריטריטים נבחרים" className={cardRail} role="list">
        {items.map((event) => (
          <div className="flex shrink-0 snap-start" key={event.id} role="listitem">
            <EventCard event={event} size="wide" />
          </div>
        ))}
      </div>
      {items.length === 0 && <NoResults />}
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

/* Hash routes keep deep links working on GitHub Pages: "#/event/<id>" is an event page, "#/events" and "#/retreats"
   are full listings ("הצג הכל"), "#/host/<id>" is an instructor profile and "#/host/<id>/events" their activities,
   "#/about" and "#/contact" are pages; any other hash is the home page. */
type Route =
  | { name: "home" }
  | { name: "about" }
  | { name: "contact" }
  | { name: "event"; id: string }
  | { name: "listing"; id: ListingId }
  | { name: "host"; id: string }
  | { name: "hostEvents"; id: string }

function parseRoute(hash: string): Route {
  if (hash === "#/about") return { name: "about" }
  if (hash === "#/contact") return { name: "contact" }
  const listing = hash.slice(2)
  if (hash.startsWith("#/") && Object.prototype.hasOwnProperty.call(listings, listing)) return { name: "listing", id: listing as ListingId }
  const host = hash.match(/^#\/host\/([\w-]+)(\/events)?$/)
  if (host && hosts[host[1]]) return { name: host[2] ? "hostEvents" : "host", id: host[1] }
  const match = hash.match(/^#\/event\/([\w-]+)$/)
  return match && events[match[1]] ? { name: "event", id: match[1] } : { name: "home" }
}

function useRoute() {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash))
  // This tab's in-app history (hashes), so "back" returns to the page the visitor came from.
  const stack = useRef<string[]>([window.location.hash])
  // Scroll position of each page when it was left, restored when coming back to it.
  const scrollByHash = useRef(new Map<string, number>())
  const isReturn = useRef(false)

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual"
    const onHashChange = () => {
      const hash = window.location.hash
      const s = stack.current
      scrollByHash.current.set(s[s.length - 1], window.scrollY)
      isReturn.current = s.length > 1 && s[s.length - 2] === hash
      if (isReturn.current) s.pop()
      else s.push(hash)
      setRoute(parseRoute(hash))
    }
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  // Returning to a page restores its position; otherwise pages open at the top (home: at a section anchor if given).
  useLayoutEffect(() => {
    const saved = scrollByHash.current.get(window.location.hash)
    if (isReturn.current && saved !== undefined) {
      window.scrollTo({ top: saved, behavior: "instant" })
      return
    }
    const anchor = route.name === "home" ? window.location.hash.slice(1) : ""
    const target = anchor ? document.getElementById(anchor) : null
    if (target) target.scrollIntoView({ block: "start", behavior: "instant" })
    else window.scrollTo({ top: 0, behavior: "instant" })
  }, [route])

  const goBack = () => {
    if (stack.current.length > 1) {
      history.back()
      return
    }
    // Opened directly from a link: there is no previous page in the site, so go to the home page.
    history.replaceState(null, "", window.location.pathname + window.location.search)
    stack.current = [""]
    isReturn.current = false
    setRoute({ name: "home" })
  }

  return { route, goBack }
}

/** Shared page chrome: the site header (logo, menu, bell) and its side menu. */
function SiteShell({
  current,
  children,
}: {
  current: "home" | "about" | "contact" | "listing" | "host"
  children: ReactNode
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  return (
    <div className="min-h-full bg-canvas">
      <AppHeader menuButtonRef={menuButtonRef} menuOpen={menuOpen} onOpenMenu={() => setMenuOpen(true)} />
      {children}
      <SideDrawer current={current} onClose={() => setMenuOpen(false)} open={menuOpen} returnFocusTo={menuButtonRef} />
    </div>
  )
}

function HomePage({ category, setCategory }: { category: string; setCategory: (next: string) => void }) {
  const slides = useFiltered(featuredRetreats)
  return (
    <SiteShell current="home">
      <main className="flex flex-col gap-8 pt-2 pb-8">
        <CategoryStrip onSelect={setCategory} selected={category} />
        <FilterChips />
        {slides.length > 0 && <FeaturedCarousel key={slides.map((e) => e.id).join()} slides={slides} />}
        <UpcomingEvents />
        <FeaturedRetreats />
      </main>
      <SiteFooter />
    </SiteShell>
  )
}

function App() {
  const { route, goBack } = useRoute()
  // Lives above the router so the chosen category survives a visit to an event page.
  const [category, setCategory] = useState<string>(categories[0].name)
  return (
    <FilterProvider>
      {route.name === "event" ? (
        <EventPage event={events[route.id]} key={route.id} onBack={goBack} />
      ) : route.name === "host" ? (
        <SiteShell current="host">
          <HostPage host={hosts[route.id]} key={route.id} />
        </SiteShell>
      ) : route.name === "hostEvents" ? (
        <SiteShell current="host">
          <EventListPage
            emptyText="אין כרגע אירועים"
            items={byNextDate(eventsByHost(route.id))}
            key={route.id}
            onBack={goBack}
            title={`האירועים של ${hosts[route.id].name}`}
          />
        </SiteShell>
      ) : route.name === "listing" ? (
        <SiteShell current="listing">
          <ListingPage id={route.id} key={route.id} onBack={goBack} />
        </SiteShell>
      ) : route.name === "about" ? (
        <SiteShell current="about">
          <AboutPage />
        </SiteShell>
      ) : route.name === "contact" ? (
        <SiteShell current="contact">
          <ContactPage />
        </SiteShell>
      ) : (
        <HomePage category={category} setCategory={setCategory} />
      )}
    </FilterProvider>
  )
}

export default App
