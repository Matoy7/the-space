/* Single date formatter for the site. Pure calendar arithmetic (no Date parsing of strings, no local timezone),
   so a stored day never shifts. Weekdays are shown only when the year is known. */

export type EventDates = {
  /** 1–12 */
  month: number
  /** First day of the event. */
  from: number
  /** Last day for multi-day events (same month). */
  to?: number
  /** Optional; enables the weekday. */
  year?: number
}

const MONTHS = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"]
const MONTHS_SHORT = ["ינו׳", "פבר׳", "מרץ", "אפר׳", "מאי", "יוני", "יולי", "אוג׳", "ספט׳", "אוק׳", "נוב׳", "דצמ׳"]
const WEEKDAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"]
const WEEKDAYS_SHORT = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"]

const daysInMonth = (month: number, year = 2024 /* leap year: allows 29 Feb when the year is unknown */) =>
  new Date(Date.UTC(year, month, 0)).getUTCDate()

/** Returns the dates normalised (from ≤ to, single day when equal) or null if they are not a real calendar date. */
export function normaliseDates(d: EventDates | undefined): EventDates | null {
  if (!d) return null
  const { month, year } = d
  if (!Number.isInteger(month) || month < 1 || month > 12) return null
  const max = daysInMonth(month, year)
  const days = [d.from, d.to ?? d.from]
  if (!days.every((n) => Number.isInteger(n) && n >= 1 && n <= max)) return null
  const [from, to] = days[0] <= days[1] ? days : [days[1], days[0]]
  return { month, year, from, to: to === from ? undefined : to }
}

const weekdayIndex = (year: number, month: number, day: number) => new Date(Date.UTC(year, month - 1, day)).getUTCDay()

/**
 * short: badge format — "17 באפר׳", "8-10 במאי", with a year "ש׳ · 24 באוק׳".
 * long:  page format  — "17 באפריל", "8-10 במאי", with a year "יום שבת, 24 באוקטובר 2026".
 * Returns null for missing/invalid dates so callers can omit the element.
 */
export function formatEventDates(raw: EventDates | undefined, style: "short" | "long"): string | null {
  const d = normaliseDates(raw)
  if (!d) return null
  // Hyphen-minus, not an en dash: between two numbers it joins them into one left-to-right run, so the range
  // reads "8-10" inside Hebrew text. An en dash is a neutral that resolves RTL here and flips it to "10–8".
  const days = d.to ? `${d.from}-${d.to}` : `${d.from}`
  if (style === "short") {
    const core = `${days} ב${MONTHS_SHORT[d.month - 1]}`
    return d.year ? `${WEEKDAYS_SHORT[weekdayIndex(d.year, d.month, d.from)]} · ${core}` : core
  }
  const core = `${days} ב${MONTHS[d.month - 1]}${d.year ? ` ${d.year}` : ""}`
  return d.year ? `יום ${WEEKDAYS[weekdayIndex(d.year, d.month, d.from)]}, ${core}` : core
}
