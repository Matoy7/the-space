/* Single source of truth for events shown across the site. Every event has a stable id used in its URL. */

import { formatEventDates, type EventDates } from "./dates"

/* import.meta.env exists in the app bundle; this module is also read at build time (link previews), where it does not. */
const BASE = typeof import.meta.env === "object" ? import.meta.env.BASE_URL : "/"
const asset = (file: string) => `${BASE}assets/${file}`

export const images = {
  logo: asset("77585.png"),
  wellness: asset("2af54.png"),
  community: asset("089e8.png"),
  retreats: asset("71e6d.png"),
  workshops: asset("19244.png"),
  meditation: asset("80ed4.png"),
  yoga: asset("6d380.png"),
}

export type Host = {
  name: string
  /** Shown before the name, e.g. "מדריכה". */
  role: string
  bio?: string
  /** Optional portrait; an initial is shown when missing. */
  photo?: string
}

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

/* ---------------------------------------------------------------------------------------------
 * DEMO CONTENT — sample summaries and organizers written for the prototype (requested by the
 * site owner). Not real event details: replace with the real text and names before launch.
 * ------------------------------------------------------------------------------------------- */
const demoDetails: Record<string, Pick<SiteEvent, "about" | "host">> = {
  "yoga-by-the-sea": {
    about: "סופשבוע של תרגול יוגה על החוף, עם שיעורי זריחה ושקיעה מול הים. בין השיעורים: מדיטציה מודרכת, תרגילי נשימה וזמן למנוחה. מתאים לכל הרמות ואין צורך בניסיון קודם. מומלץ להביא מזרן, מגבת ובקבוק מים.",
    host: { name: "נועה לוי", role: "מדריכה", bio: "מורה ליוגה ויניאסה ומדיטציה" },
  },
  "yoga-among-olives": {
    about: "שלושה ימים של יוגה בין עצי הזית של כפר ורדים: תרגול בוקר רך, הליכות בטבע ושיעורי ערב איטיים. נתארח במתחם כפרי עם ארוחות צמחוניות, ונשאיר זמן לשקט ולמנוחה. מתאים למתחילים ולמתרגלים ותיקים.",
    host: { name: "יעל ברק", role: "מדריכה", bio: "מורה ליוגה האטה ויין" },
  },
  "crater-sunrise": {
    about: "ריטריט קטן ושקט על שפת מכתש רמון. נקום לפני הזריחה למדיטציה מול הנוף, נתרגל יוגה בבוקר ונצא להליכות קצרות במדבר. בערבים נקיים מעגלי שיחה ותצפית כוכבים. מספר המקומות מוגבל כדי לשמור על אווירה אינטימית.",
    host: { name: "אורי שחר", role: "מדריך", bio: "מנחה מדיטציה ומדריך טיולים במדבר" },
  },
  "sound-meditation": {
    about: "ערב של הרפיה עמוקה בליווי קערות טיבטיות, גונג ופעמונים. נשכב בנוחות ונניח לצלילים להוביל את הנשימה ואת הגוף לשקט. אין צורך בניסיון קודם; כדאי להגיע בבגדים נוחים ולהביא שמיכה קלה.",
    host: { name: "מאיה כהן", role: "מדריכה", bio: "מטפלת בצלילים ומנחת מדיטציה" },
  },
  "desert-vipassana": {
    about: "שלושה ימים של שתיקה ותרגול ויפאסנה במדבר יהודה. נתרגל ישיבה והליכה מודעת, עם הנחיה קצרה בכל בוקר ושיחת סיכום בסוף כל יום. הלינה באוהלים פשוטים והארוחות צמחוניות. מתאים למי שכבר התנסה במדיטציה.",
    host: { name: "דניאל אבירם", role: "מדריך", bio: "מורה לויפאסנה ולתרגול שתיקה" },
  },
  "galilee-yoga-retreat": {
    about: "יום מלא של יוגה בנוף הגליל העליון: תרגול בוקר דינמי, סדנת נשימה אחר הצהריים ושיעור יין רגוע לסיום. ארוחת צהריים מקומית כלולה. מתאים לכל הרמות, עם התאמות למתחילים.",
    host: { name: "תמר גולן", role: "מדריכה", bio: "מורה ליוגה אשטנגה ויין" },
  },
  "nature-connection": {
    about: "ריטריט של יוגה וסדנאות בלב הטבע של הגליל העליון. בתוכנית: תרגול יוגה יומי, סדנת צמחי מרפא, הליכה מודעת ביער וערב סביב המדורה. נישן בבקתות עץ ונאכל ארוחות מבושלות מתוצרת מקומית.",
    host: { name: "רון אלמוג", role: "מדריך", bio: "מורה ליוגה ומנחה סדנאות בטבע" },
  },
}
for (const [id, details] of Object.entries(demoDetails)) Object.assign(events[id], details)

/* Home page sections, in display order. */
export const featuredIds = ["yoga-by-the-sea", "yoga-among-olives", "crater-sunrise"]
export const upcomingIds = ["sound-meditation", "desert-vipassana", "galilee-yoga-retreat"]
export const selectedRetreatIds = ["nature-connection", "galilee-yoga-retreat", "desert-vipassana"]

export const byIds = (ids: string[]) => ids.map((id) => events[id])

export const eventHref = (id: string) => `#/event/${id}`

/** Path of the static share page for an event (has its own link-preview tags; opens the event page). */
export const sharePath = (id: string) => `e/${id}/`

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
