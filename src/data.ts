/* Single source of truth for events shown across the site. Every event has a stable id used in its URL. */

import { formatEventDates, type EventDates } from "./dates"

const asset = (file: string) => `${import.meta.env.BASE_URL}assets/${file}`

export const images = {
  logo: asset("77585.png"),
  wellness: asset("2af54.png"),
  community: asset("089e8.png"),
  retreats: asset("71e6d.png"),
  workshops: asset("19244.png"),
  meditation: asset("80ed4.png"),
  yoga: asset("6d380.png"),
}

export type Host = { name: string; bio: string; photo: string }

export type SiteEvent = {
  id: string
  title: string
  /** Short descriptor shown under the title. */
  subtitle?: string
  /** Display location, "<venue>, <area>" or just "<area>". */
  location: string
  /** Area used for grouping ("more in …"); matches the header location picker. */
  area: string
  /** Calendar dates; no year is stored for the current events, so weekdays are not shown. */
  dates?: EventDates
  time?: string
  image: string
  /* The fields below have no data yet; the event page shows each section only when it is provided. */
  priceRange?: string
  about?: string
  host?: Host
  /** External registration page for this event. */
  registrationUrl?: string
  /** Set when registration exists but is not available. */
  registrationStatus?: "closed" | "full"
}

export const events: Record<string, SiteEvent> = {
  "yoga-by-the-sea": {
    id: "yoga-by-the-sea",
    title: "יוגה מול הים",
    subtitle: "ריטריט סופשבוע בחוף גורדון, תל אביב",
    location: "חוף גורדון, תל אביב",
    area: "תל אביב",
    dates: { month: 4, from: 17 }, // was "17-17 באפריל"
    image: asset("f1bd4.png"),
  },
  "yoga-among-olives": {
    id: "yoga-among-olives",
    title: "יוגה בין הזיתים",
    location: "כפר ורדים, גליל מערבי",
    area: "גליל מערבי",
    dates: { month: 5, from: 8, to: 10 },
    image: asset("retreat-galilee.jpg"),
  },
  "crater-sunrise": {
    id: "crater-sunrise",
    title: "זריחה במכתש",
    location: "מצפה רמון",
    area: "מצפה רמון",
    dates: { month: 5, from: 22, to: 24 },
    image: asset("retreat-ramon.jpg"),
  },
  "sound-meditation": {
    id: "sound-meditation",
    title: "מדיטציית צלילים",
    location: "מרכז אננדה, תל אביב",
    area: "תל אביב",
    dates: { month: 4, from: 19 },
    time: "19:30",
    image: asset("bcf2e.png"),
  },
  "desert-vipassana": {
    id: "desert-vipassana",
    title: "ויפאסנה במדבר",
    subtitle: "ריטריט מדיטציית ויפאסנה",
    location: "מדבר יהודה",
    area: "מדבר יהודה",
    dates: { month: 11, from: 2, to: 4 },
    image: asset("2a252.png"),
  },
  "galilee-yoga-retreat": {
    id: "galilee-yoga-retreat",
    title: "ריטריט יוגה בגליל",
    subtitle: "ריטריט יוגה בנוף הגליל",
    location: "גליל עליון",
    area: "גליל עליון",
    dates: { month: 11, from: 16 }, // was "16-16 בנובמבר"
    image: asset("45898.png"),
  },
  "nature-connection": {
    id: "nature-connection",
    title: "חיבור לטבע",
    subtitle: "ריטריט יוגה וסדנאות בטבע",
    location: "גליל עליון",
    area: "גליל עליון",
    dates: { month: 5, from: 23, to: 25 }, // was "25-23 במאי"
    image: asset("54a2d.png"),
  },
}

/* Home page sections, in display order. */
export const featuredIds = ["yoga-by-the-sea", "yoga-among-olives", "crater-sunrise"]
export const upcomingIds = ["sound-meditation", "desert-vipassana", "galilee-yoga-retreat"]
export const selectedRetreatIds = ["nature-connection", "galilee-yoga-retreat", "desert-vipassana"]

export const byIds = (ids: string[]) => ids.map((id) => events[id])

export const eventHref = (id: string) => `#/event/${id}`

/** Compact badge text, e.g. "19 באפר׳ · 19:30"; null when the event has no valid date. */
export function badgeLabel(e: SiteEvent): string | null {
  const date = formatEventDates(e.dates, "short")
  if (!date) return null
  return e.time ? `${date} · ${e.time}` : date
}

/** Splits "<venue>, <area>" into its parts; a bare area has no venue line. */
export function splitLocation(location: string): { primary: string; secondary?: string } {
  const i = location.indexOf(",")
  if (i === -1) return { primary: location }
  return { primary: location.slice(0, i).trim(), secondary: location.slice(i + 1).trim() }
}

/** Other events in the same area, or every other event when the area has none. */
export function relatedEvents(current: SiteEvent): { sameArea: boolean; items: SiteEvent[] } {
  const others = Object.values(events).filter((e) => e.id !== current.id)
  const same = others.filter((e) => e.area === current.area)
  return same.length > 0 ? { sameArea: true, items: same } : { sameArea: false, items: others }
}
