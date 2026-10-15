import { useEffect, useRef, useState, type ReactNode } from "react"
import {
  BellIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronForwardIcon,
  HeartIcon,
  MapPinIcon,
  MenuIcon,
} from "./icons"

const assetPathPrefix = `${import.meta.env.BASE_URL}assets`
const imgLogo = `${assetPathPrefix}/77585.png`
const imgWellness = `${assetPathPrefix}/2af54.png`
const imgCommunity = `${assetPathPrefix}/089e8.png`
const imgRetreats = `${assetPathPrefix}/71e6d.png`
const imgWorkshops = `${assetPathPrefix}/19244.png`
const imgMeditation = `${assetPathPrefix}/80ed4.png`
const imgYoga = `${assetPathPrefix}/6d380.png`
const imgHero = `${assetPathPrefix}/f1bd4.png`
const imgGalilee = `${assetPathPrefix}/45898.png`
const imgDesert = `${assetPathPrefix}/2a252.png`
const imgSoundBath = `${assetPathPrefix}/bcf2e.png`
const imgNature = `${assetPathPrefix}/54a2d.png`
const imgRetreatGalilee = `${assetPathPrefix}/retreat-galilee.jpg`
const imgRetreatRamon = `${assetPathPrefix}/retreat-ramon.jpg`

const featuredRetreats = [
  {
    title: "יוגה מול הים",
    date: "17-17 באפריל",
    location: "חוף גורדון, תל אביב",
    image: imgHero,
  },
  {
    title: "יוגה בין הזיתים",
    date: "8-10 במאי",
    location: "כפר ורדים, גליל מערבי",
    image: imgRetreatGalilee,
  },
  {
    title: "זריחה במכתש",
    date: "22-24 במאי",
    location: "מצפה רמון",
    image: imgRetreatRamon,
  },
]

const AUTOPLAY_MS = 2500
const SWIPE_THRESHOLD_PX = 40

/* Listed in reading order (right → left in RTL). */
const categories = [
  { name: "יוגה", image: imgYoga, active: true },
  { name: "מדיטציה", image: imgMeditation },
  { name: "סדנאות", image: imgWorkshops },
  { name: "ריטריטים", image: imgRetreats },
  { name: "קהילה", image: imgCommunity },
  { name: "וולנס", image: imgWellness },
]

const eventCards = [
  {
    title: "מדיטציית צלילים",
    location: "מרכז אננדה, תל אביב",
    date: "19 באפריל • 19:30",
    image: imgSoundBath,
  },
  {
    title: "ויפאסנה במדבר",
    location: "מדבר יהודה",
    date: "2-4 בנובמבר",
    image: imgDesert,
  },
  {
    title: "ריטריט יוגה בגליל",
    location: "גליל עליון",
    date: "16-16 בנובמבר",
    image: imgGalilee,
  },
]

/* ---------- Shared primitives ---------- */

const pressable = "transition-[background-color,transform] duration-150 active:scale-[0.97]"

/** Heart toggle on photos: outline on a dark glass chip; when saved, a terracotta heart on a light chip. */
function FavoriteButton({ className = "", size = 20 }: { className?: string; size?: number }) {
  const [saved, setSaved] = useState(false)
  return (
    <button
      aria-label="שמור למועדפים"
      aria-pressed={saved}
      className={`flex size-10 items-center justify-center rounded-control backdrop-blur-sm transition-[background-color,color,transform] duration-200 active:scale-90 ${
        saved ? "bg-white/90 text-accent" : "bg-black/30 text-white active:bg-black/45"
      } ${className}`}
      onClick={() => setSaved((v) => !v)}
      type="button"
    >
      <HeartIcon fill={saved ? "currentColor" : "none"} size={size} />
    </button>
  )
}

function PrimaryButton({ children }: { children: ReactNode }) {
  return (
    <button
      className={`inline-flex h-10 shrink-0 items-center gap-1 rounded-control bg-accent ps-4 pe-3 text-meta font-semibold text-white active:bg-accent-pressed ${pressable}`}
      type="button"
    >
      {children}
      <ChevronForwardIcon size={16} />
    </button>
  )
}

function MetaItem({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      {icon}
      <span>{children}</span>
    </span>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between px-4">
      <h2 className="text-heading font-bold text-ink">{title}</h2>
      <button
        className="-me-2 inline-flex h-10 items-center gap-1 rounded-control px-2 text-meta font-semibold text-accent transition-colors active:bg-sand"
        type="button"
      >
        הצג הכל
        <ChevronForwardIcon size={16} />
      </button>
    </header>
  )
}

/* ---------- Sections ---------- */

/** Shared header control: 40px, fully rounded, warm-beige surface, 20px ink icon. */
const headerControl = `flex h-10 items-center justify-center rounded-control bg-header-control text-ink active:bg-line ${pressable}`

function AppHeader() {
  return (
    <header className="sticky top-0 z-10 bg-header pt-[env(safe-area-inset-top)]">
      <h1 className="sr-only">המרחב</h1>
      {/* Equal 1fr side columns keep the location centred on the viewport, not just between the buttons. */}
      <div className="grid h-14 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-4">
        <button aria-label="פתח תפריט" className={`${headerControl} w-10 justify-self-start`} type="button">
          <MenuIcon />
        </button>
        <button
          aria-label="מיקום: תל אביב. החלפת מיקום"
          className={`${headerControl} gap-2 justify-self-center ps-3 pe-2 text-meta font-semibold whitespace-nowrap`}
          type="button"
        >
          <MapPinIcon />
          <span>תל אביב</span>
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
  date,
  image,
  index,
  location,
  title,
  total,
}: (typeof featuredRetreats)[number] & { active: boolean; index: number; total: number }) {
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
      <FavoriteButton className="absolute end-4 top-4" />

      <h2 className="relative text-display font-bold">{title}</h2>
      <div className="relative mt-2 flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1 text-meta text-white/90">
          <MetaItem icon={<CalendarIcon size={16} />}>{date}</MetaItem>
          <MetaItem icon={<MapPinIcon size={16} />}>{location}</MetaItem>
        </div>
        <PrimaryButton>לפרטים</PrimaryButton>
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
          <FeaturedSlide
            {...slide}
            active={index === active}
            index={index}
            key={slide.title}
            total={total}
          />
        ))}
      </div>

      <div className="flex items-center justify-center">
        {featuredRetreats.map((slide, index) => (
          <button
            aria-current={index === active ? "true" : undefined}
            aria-label={`מעבר לשקופית ${index + 1}: ${slide.title}`}
            className="group flex h-10 items-center px-2"
            key={slide.title}
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

function EventCard({ date, image, location, title }: (typeof eventCards)[number]) {
  return (
    <article className="flex w-60 shrink-0 snap-start flex-col overflow-hidden rounded-card border border-line/60 bg-surface shadow-card">
      <div className="relative aspect-[3/2] overflow-hidden bg-sand">
        <img alt="" className="size-full object-cover" src={image} />
        <FavoriteButton className="absolute end-2 top-2" size={18} />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-title font-bold text-ink">{title}</h3>
        <p className="mt-1 text-meta text-ink-muted">{location}</p>
        <div className="mt-auto pt-4">
          <div className="border-t border-line pt-4 text-meta text-ink-muted">
            <MetaItem icon={<CalendarIcon size={16} />}>{date}</MetaItem>
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
        {eventCards.map((card) => (
          <EventCard {...card} key={card.title} />
        ))}
      </div>
    </section>
  )
}

/* Card order is preserved: the original card first, then retreats already listed in the app's events. */
const selectedRetreats = [
  {
    title: "חיבור לטבע",
    description: "ריטריט יוגה וסדנאות בטבע",
    location: "גליל עליון",
    date: "25-23 במאי",
    image: imgNature,
  },
  {
    title: "ריטריט יוגה בגליל",
    description: "ריטריט יוגה בנוף הגליל",
    location: "גליל עליון",
    date: "16-16 בנובמבר",
    image: imgGalilee,
  },
  {
    title: "ויפאסנה במדבר",
    description: "ריטריט מדיטציית ויפאסנה",
    location: "מדבר יהודה",
    date: "2-4 בנובמבר",
    image: imgDesert,
  },
]

function RetreatCard({ date, description, image, location, title }: (typeof selectedRetreats)[number]) {
  return (
    <article className="flex w-[82vw] max-w-[340px] shrink-0 overflow-hidden rounded-card border border-line/60 bg-surface shadow-card">
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <h3 className="text-title font-bold text-ink">{title}</h3>
        <p className="mt-1 text-meta text-ink-muted">{description}</p>
        <div className="mt-4 flex flex-col gap-2 text-meta text-ink-muted">
          <MetaItem icon={<MapPinIcon size={16} />}>{location}</MetaItem>
          <MetaItem icon={<CalendarIcon size={16} />}>{date}</MetaItem>
        </div>
        <div className="mt-auto pt-4">
          <PrimaryButton>לפרטים</PrimaryButton>
        </div>
      </div>
      <div className="w-[42%] shrink-0 bg-sand">
        <img alt="" className="size-full object-cover" draggable={false} src={image} />
      </div>
    </article>
  )
}

function FeaturedRetreats() {
  return (
    <section className={`flex flex-col gap-4 ${anchorOffset}`} id="retreats">
      <SectionHeader title="ריטריטים נבחרים" />
      <div aria-label="ריטריטים נבחרים" className={cardRail} role="list">
        {selectedRetreats.map((retreat) => (
          <div className="flex shrink-0 snap-start" key={retreat.title} role="listitem">
            <RetreatCard {...retreat} />
          </div>
        ))}
      </div>
    </section>
  )
}

/* Only destinations that exist on the site today (in-page sections). */
const footerLinks = [
  { label: "גילוי אירועים", href: "#events" },
  { label: "ריטריטים", href: "#retreats" },
]

function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="rounded-t-feature bg-sand px-4 pt-8 pb-[calc(env(safe-area-inset-bottom)+24px)]">
      <img alt="המרחב" className="h-10 w-auto" height={40} src={imgLogo} width={121} />
      <p className="mt-4 max-w-[34ch] text-meta text-ink-muted">
        אירועי וולנס, סדנאות וריטריטים מכל הארץ, מרוכזים במקום אחד — כדי שיהיה קל למצוא את מה שמתאים לכם.
      </p>

      <nav aria-label="ניווט בתחתית העמוד" className="mt-6 border-t border-ink/10">
        <ul>
          {footerLinks.map((link) => (
            <li className="border-b border-ink/10" key={link.href}>
              <a
                className="flex h-12 items-center justify-between text-body font-semibold text-ink transition-colors active:text-accent"
                href={link.href}
              >
                {link.label}
                <ChevronForwardIcon className="text-ink-muted" size={16} />
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <p className="mt-6 text-meta text-ink-muted">© {year} המרחב. כל הזכויות שמורות.</p>
    </footer>
  )
}

function App() {
  return (
    <div className="min-h-full bg-canvas">
      <AppHeader />
      <main className="flex flex-col gap-8 pt-2 pb-8">
        <CategoryStrip />
        <FeaturedCarousel />
        <UpcomingEvents />
        <FeaturedRetreats />
      </main>
      <SiteFooter />
    </div>
  )
}

export default App
