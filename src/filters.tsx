import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import { normaliseDates } from "./dates"
import { listings, type SiteEvent } from "./data"

/* ---------- Model ---------- */

export const regions = [
  { id: "all", label: "כל הארץ" },
  { id: "north", label: "צפון" },
  { id: "sharon", label: "שרון" },
  { id: "center", label: "מרכז" },
  { id: "jerusalem", label: "ירושלים והסביבה" },
  { id: "south", label: "דרום" },
] as const

export type RegionId = (typeof regions)[number]["id"]

/** Region of each event area (SiteEvent.area). An area missing here only matches "כל הארץ". */
const areaRegion: Record<string, RegionId> = {
  "תל אביב": "center",
  "גליל מערבי": "north",
  "גליל עליון": "north",
  "מצפה רמון": "south",
  "מדבר יהודה": "south",
}

/** Region of an event via its area; null when the area isn't mapped. */
export function regionOf(e: SiteEvent): RegionId | null {
  return areaRegion[e.area] ?? null
}

export type PlaceRegionId = Exclude<RegionId, "all">

/**
 * Homepage region discovery, in display order, with each region's name there. Only regions that have activities
 * are shown. ("אונליין" has no support in the data yet: events have no online flag.)
 */
export const discoveryRegions: { id: PlaceRegionId; label: string }[] = [
  { id: "north", label: "צפון" },
  { id: "center", label: "תל אביב והסביבה" },
  { id: "sharon", label: "שרון" },
  { id: "jerusalem", label: "ירושלים והסביבה" },
  { id: "south", label: "דרום" },
]

/** All activities (events and retreats) in a region, in the events listing order. */
export function regionEvents(id: PlaceRegionId): SiteEvent[] {
  return listings.events.items().filter((e) => regionOf(e) === id)
}

export const dateOptions = [
  { id: "today", label: "היום" },
  { id: "week", label: "השבוע" },
  { id: "weekend", label: "סוף השבוע" },
  { id: "custom", label: "בחירת תאריך" },
] as const

export type DateOptionId = (typeof dateOptions)[number]["id"]

export const PRICE_MAX = 1000
export const PRICE_STEP = 50

export type Filters = {
  region: RegionId
  /** null = any date. */
  date: DateOptionId | null
  /** "YYYY-MM-DD" (native date input values); used when date === "custom". `to` is optional (single day). */
  from: string
  to: string
  freeOnly: boolean
  /** PRICE_MAX means no price limit. */
  maxPrice: number
}

export const defaultFilters: Filters = { region: "all", date: null, from: "", to: "", freeOnly: false, maxPrice: PRICE_MAX }

/** True when the filters restrict anything (drives the dot on the filter button). */
export function isActive(f: Filters): boolean {
  return (
    f.region !== "all" ||
    (f.date !== null && (f.date !== "custom" || f.from !== "")) ||
    f.freeOnly ||
    f.maxPrice < PRICE_MAX
  )
}

/* ---------- Dates (whole days, local calendar) ---------- */

const DAY = 86_400_000
const dayNumber = (y: number, m: number, d: number) => Math.round(Date.UTC(y, m - 1, d) / DAY)

function todayNumber(now: Date) {
  return dayNumber(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

function parseInputDate(value: string): number | null {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return m ? dayNumber(+m[1], +m[2], +m[3]) : null
}

/**
 * The event's days as [first, last] day numbers. Events stored without a year are taken as their next
 * occurrence: this year, or next year once this year's dates have passed.
 */
function eventDays(e: SiteEvent, now: Date): [number, number] | null {
  const d = normaliseDates(e.dates)
  if (!d) return null
  const span = (y: number): [number, number] => [dayNumber(y, d.month, d.from), dayNumber(y, d.month, d.to ?? d.from)]
  if (d.year) return span(d.year)
  const thisYear = span(now.getFullYear())
  return thisYear[1] >= todayNumber(now) ? thisYear : span(now.getFullYear() + 1)
}

/** Selected date window as [first, last] day numbers; null = no date restriction. Week runs Sunday–Saturday. */
function dateWindow(f: Filters, now: Date): [number, number] | null {
  const today = todayNumber(now)
  const weekday = now.getDay() // 0 = Sunday … 6 = Saturday
  switch (f.date) {
    case "today":
      return [today, today]
    case "week":
      return [today, today + (6 - weekday)]
    case "weekend": {
      // Friday–Saturday of this week (from today when the weekend has already started).
      const friday = today + (5 - weekday)
      return [Math.max(today, friday), today + (6 - weekday)]
    }
    case "custom": {
      const from = parseInputDate(f.from)
      if (from === null) return null
      const to = parseInputDate(f.to) ?? from
      return from <= to ? [from, to] : [to, from]
    }
    default:
      return null
  }
}

/** `items` ordered by their next occurrence (soonest first); undated events go last, in their original order. */
export function byNextDate(items: SiteEvent[], now = new Date()): SiteEvent[] {
  const first = (e: SiteEvent) => eventDays(e, now)?.[0] ?? Number.POSITIVE_INFINITY
  return [...items].sort((a, b) => first(a) - first(b))
}

/* ---------- Matching ---------- */

/** One predicate for every collection on the site (home sections, listings, related events). */
export function matcher(f: Filters, now = new Date()): (e: SiteEvent) => boolean {
  const window = dateWindow(f, now)
  return (e) => {
    if (f.region !== "all" && regionOf(e) !== f.region) return false
    if (window) {
      const days = eventDays(e, now)
      // Overlap: any day of the event falls inside the window.
      if (!days || days[1] < window[0] || days[0] > window[1]) return false
    }
    if (f.freeOnly || f.maxPrice < PRICE_MAX) {
      // A price restriction can only be confirmed for events with a known price.
      const p = e.price
      if (typeof p !== "number" || !Number.isFinite(p) || p < 0) return false
      if (f.freeOnly ? p !== 0 : p > f.maxPrice) return false
    }
    return true
  }
}

/* ---------- Shared state ---------- */

type FilterState = { filters: Filters; setFilters: (next: Filters) => void; active: boolean }

const FilterContext = createContext<FilterState | null>(null)

/** Holds the applied filters above the router, so they persist across pages and reopening the sheet. */
export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState(defaultFilters)
  const value = useMemo(() => ({ filters, setFilters, active: isActive(filters) }), [filters])
  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
}

export function useFilters(): FilterState {
  const ctx = useContext(FilterContext)
  if (!ctx) throw new Error("useFilters must be used inside <FilterProvider>")
  return ctx
}

/** `items` narrowed by the applied filters, order preserved. */
export function useFiltered(items: SiteEvent[]): SiteEvent[] {
  const { filters } = useFilters()
  return useMemo(() => items.filter(matcher(filters)), [items, filters])
}
