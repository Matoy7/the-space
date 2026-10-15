import type { ReactNode } from "react"
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronForwardIcon,
  HeartIcon,
  MapPinIcon,
  MenuIcon,
} from "./icons"

const assetPathPrefix = `${import.meta.env.BASE_URL}assets`
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

function IconButton({
  children,
  label,
  tone = "sand",
  className = "",
}: {
  children: ReactNode
  label: string
  tone?: "sand" | "overlay"
  className?: string
}) {
  const tones = {
    sand: "bg-sand text-ink active:bg-line",
    overlay: "bg-black/30 text-white backdrop-blur-sm active:bg-black/45",
  }
  return (
    <button
      aria-label={label}
      className={`flex size-10 items-center justify-center rounded-control ${tones[tone]} ${pressable} ${className}`}
      type="button"
    >
      {children}
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

/* Header geometry is matched to the approved reference at a 390px viewport. */
function Logo() {
  return (
    <span className="relative block h-[29.1px] w-[91.4px] translate-x-[0.81px] -translate-y-[0.46px] text-black">
      <svg
        aria-hidden="true"
        className="absolute inset-0 overflow-visible"
        fill="none"
        height="29.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        viewBox="0 0 91.4 29.1"
        width="91.4"
      >
        <path d="M0.75 7.65V0.75H7.65M83.75 0.75H90.65V7.65M90.65 21.45V28.35H83.75M7.65 28.35H0.75V21.45" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[18.95px] leading-none font-bold tracking-[0.89px]">
        <span className="-me-[0.89px] translate-x-[0.26px] -translate-y-[2.16px]">המרחב</span>
      </span>
    </span>
  )
}

function HeaderMenuIcon() {
  return (
    <svg
      aria-hidden="true"
      className="block translate-x-[0.3px] translate-y-[0.6px]"
      fill="none"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={2}
      viewBox="0 0 20 20"
      width="20"
    >
      <path d="M3.35 5.4H16.65M3.35 10H16.65M3.35 14.6H16.65" />
    </svg>
  )
}

function AppHeader() {
  return (
    <header className="sticky top-0 z-10 bg-header pt-[env(safe-area-inset-top)] pb-[2.5px]">
      <div className="relative flex h-[54px] items-center justify-center">
        <button
          aria-label="פתח תפריט"
          className={`absolute start-[13.5px] top-1/2 flex size-[40.75px] -translate-y-1/2 items-center justify-center rounded-control bg-header-control text-ink ${pressable}`}
          type="button"
        >
          <HeaderMenuIcon />
        </button>
        <Logo />
        <button
          className={`absolute end-4 top-1/2 flex h-[34.25px] -translate-y-1/2 items-center rounded-control before:absolute before:inset-x-0 before:-inset-y-[5px] before:content-[''] bg-header-control ps-[8.6px] pe-[12.6px] text-meta font-normal text-ink ${pressable}`}
          type="button"
        >
          <ChevronDownIcon className="text-header-icon" size={16.5} strokeWidth={2.1} />
          <span className="ms-[4.9px] me-[5.1px]">תל אביב</span>
          <MapPinIcon className="translate-y-[0.8px] text-header-icon" size={18.4} strokeWidth={2.1} />
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

function FeaturedRetreat() {
  return (
    <section aria-label="מומלץ" className="flex flex-col gap-4 px-4">
      <article className="relative flex aspect-[5/4] flex-col justify-end overflow-hidden rounded-feature bg-hero p-6 text-white">
        <img
          alt=""
          className="pointer-events-none absolute inset-0 size-full object-cover"
          src={imgHero}
        />
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <IconButton className="absolute end-4 top-4" label="שמור למועדפים" tone="overlay">
          <HeartIcon />
        </IconButton>

        <div className="relative flex flex-col gap-1">
          <h1 className="text-display font-bold">יוגה מול הים</h1>
          <p className="text-body text-white/90">ריטריט סופשבוע בחוף גורדון, תל אביב</p>
        </div>
        <div className="relative mt-4 flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1 text-meta text-white/90">
            <MetaItem icon={<CalendarIcon size={16} />}>17-17 באפריל</MetaItem>
            <MetaItem icon={<MapPinIcon size={16} />}>חוף גורדון, תל אביב</MetaItem>
          </div>
          <PrimaryButton>לפרטים</PrimaryButton>
        </div>
      </article>

      <div aria-hidden="true" className="flex items-center justify-center gap-2">
        <span className="h-1.5 w-6 rounded-full bg-accent" />
        <span className="h-1.5 w-2 rounded-full bg-line" />
        <span className="h-1.5 w-2 rounded-full bg-line" />
      </div>
    </section>
  )
}

function EventCard({ date, image, location, title }: (typeof eventCards)[number]) {
  return (
    <article className="flex w-60 shrink-0 snap-start flex-col overflow-hidden rounded-card border border-line/60 bg-surface shadow-card">
      <div className="relative aspect-[3/2] overflow-hidden bg-sand">
        <img alt="" className="size-full object-cover" src={image} />
        <IconButton className="absolute end-2 top-2" label="הוסף למועדפים" tone="overlay">
          <HeartIcon size={18} />
        </IconButton>
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

function UpcomingEvents() {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader title="אירועים קרובים" />
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2">
        {eventCards.map((card) => (
          <EventCard {...card} key={card.title} />
        ))}
      </div>
    </section>
  )
}

function FeaturedRetreats() {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader title="ריטריטים נבחרים" />
      <div className="px-4">
        <article className="flex overflow-hidden rounded-card border border-line/60 bg-surface shadow-card">
          <div className="flex min-w-0 flex-1 flex-col p-4">
            <h3 className="text-title font-bold text-ink">חיבור לטבע</h3>
            <p className="mt-1 text-meta text-ink-muted">ריטריט יוגה וסדנאות בטבע</p>
            <div className="mt-4 flex flex-col gap-2 text-meta text-ink-muted">
              <MetaItem icon={<MapPinIcon size={16} />}>גליל עליון</MetaItem>
              <MetaItem icon={<CalendarIcon size={16} />}>25-23 במאי</MetaItem>
            </div>
            <div className="mt-4">
              <PrimaryButton>לפרטים</PrimaryButton>
            </div>
          </div>
          <div className="w-[42%] shrink-0 bg-sand">
            <img alt="" className="size-full object-cover" src={imgNature} />
          </div>
        </article>
      </div>
    </section>
  )
}

function App() {
  return (
    <div className="min-h-full bg-canvas">
      <AppHeader />
      <main className="flex flex-col gap-8 pt-2 pb-[calc(env(safe-area-inset-bottom)+32px)]">
        <CategoryStrip />
        <FeaturedRetreat />
        <UpcomingEvents />
        <FeaturedRetreats />
      </main>
    </div>
  )
}

export default App
