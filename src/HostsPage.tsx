import { useEffect, useMemo, useState } from "react"
import { expertiseTags, hostExpertise, hostHref, hosts, type ExpertiseTag, type Host } from "./data"
import { ChevronForwardIcon, SearchIcon } from "./icons"
import { pressable } from "./ui"

const heroImage = `${import.meta.env.BASE_URL}assets/f1bd4.png`

type Entry = { host: Host; tags: ExpertiseTag[]; haystack: string }

/* Every instructor with their expertise and the text the search matches (name, professional line, expertise). */
const directory: Entry[] = Object.values(hosts).map((host) => {
  const tags = hostExpertise(host)
  return { host, tags, haystack: [host.name, host.bio ?? "", ...tags].join(" ").toLowerCase() }
})

/** Chips only for areas that at least one instructor actually has. */
const availableTags = expertiseTags.filter((t) => directory.some((d) => d.tags.includes(t)))

const countLabel = (n: number) => (n === 1 ? "תוצאה אחת" : `${n} מדריכים ומנחים`)

/** Link wording follows the instructor's own role label: "מדריכה" → "לפרופיל המדריכה", "מדריך" → "לפרופיל המדריך". */
const profileLabel = (host: Host) => (host.role.endsWith("ה") ? "לפרופיל המדריכה" : "לפרופיל המדריך")

function Portrait({ host }: { host: Host }) {
  return host.photo ? (
    <img alt="" className="size-full object-cover" src={host.photo} />
  ) : (
    // No portrait in the data: the instructor's initial, as on event pages and profiles.
    <span aria-hidden="true" className="flex size-full items-center justify-center text-page-title font-bold text-ink/70">
      {host.name.trim().charAt(0)}
    </span>
  )
}

function HostCard({ entry }: { entry: Entry }) {
  const { host, tags } = entry
  const href = hostHref(host.id)
  return (
    <article className="flex gap-4 rounded-card border border-line/60 bg-surface p-3 shadow-card">
      <div className="flex min-w-0 flex-1 flex-col py-1">
        <h2 className="text-heading font-bold text-ink">{host.name}</h2>
        {host.bio && <p className="mt-1 text-body text-ink-muted">{host.bio}</p>}
        {tags.length > 0 && (
          <ul aria-label="תחומי התמחות" className="mt-3 flex flex-wrap gap-2">
            {tags.map((t) => (
              <li className="rounded-control bg-header-control px-3 py-0.5 text-meta text-ink" key={t}>
                {t}
              </li>
            ))}
          </ul>
        )}
        {host.about && <p className="mt-3 line-clamp-2 text-meta text-ink">{host.about}</p>}
        <div className="mt-auto pt-3">
          <a
            className="flex items-center gap-1 border-t border-line pt-3 text-meta font-semibold text-accent"
            href={href}
          >
            {profileLabel(host)}
            <ChevronForwardIcon size={16} />
          </a>
        </div>
      </div>
      {/* The portrait opens the same profile; the text link above is the accessible one. */}
      <a
        aria-hidden="true"
        className="w-[42%] max-w-40 shrink-0 self-start overflow-hidden rounded-card bg-sand"
        href={href}
        tabIndex={-1}
      >
        <div className="aspect-[312/274]">
          <Portrait host={host} />
        </div>
      </a>
    </article>
  )
}

/* Instructors directory ("#/hosts"), after the approved reference: hero, live search, expertise chips, count, cards. */
export default function HostsPage() {
  const [query, setQuery] = useState("")
  const [tag, setTag] = useState<ExpertiseTag | null>(null)

  useEffect(() => {
    const previous = document.title
    document.title = "מדריכים ומנחים · המרחב"
    return () => {
      document.title = previous
    }
  }, [])

  const results = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    return directory.filter(
      (d) => (!tag || d.tags.includes(tag)) && words.every((w) => d.haystack.includes(w)),
    )
  }, [query, tag])

  const chip = (selected: boolean) =>
    `flex h-10 shrink-0 items-center rounded-control px-4 text-meta font-medium whitespace-nowrap transition-colors ${
      selected ? "bg-olive text-white" : "bg-header-control text-ink active:bg-line"
    }`

  return (
    <main className="pt-2 pb-12">
      <section className="relative mx-4 h-36 overflow-hidden rounded-feature bg-sand shadow-card">
        {/* Mirrored and widened from the right so the person sits at the left, clear of the text on the right. */}
        <img
          alt=""
          className="absolute inset-y-0 right-0 h-full w-[135%] max-w-none -scale-x-100 object-cover object-[50%_22%]"
          src={heroImage}
        />
        {/* RTL: text on the right, so the shade runs from the right edge. */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/30 to-transparent" />
        <div className="relative flex h-full max-w-[68%] flex-col justify-center px-5 text-white">
          <h1 className="text-display font-bold">מדריכים ומנחים</h1>
          <p className="mt-1 text-body text-white/90">הכירו אנשי מקצוע בתחומי הוולנס, ומצאו את האדם שמתאים לכם.</p>
        </div>
      </section>

      <div className="mx-4 mt-4">
        <label className="flex h-12 items-center gap-3 rounded-control border border-line/60 bg-surface px-4 shadow-card focus-within:border-olive">
          <input
            aria-label="חיפוש מדריכים"
            className="min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-muted"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="שם מדריך או תחום התמחות"
            type="search"
            value={query}
          />
          <SearchIcon className="text-accent" />
        </label>
      </div>

      {availableTags.length > 0 && (
        <div className="mt-4">
          <p className="px-4 text-meta text-ink-muted" id="expertise-label">
            תחום התמחות
          </p>
          <div aria-labelledby="expertise-label" className="mt-2 flex gap-2 overflow-x-auto overscroll-x-contain px-4 pb-1" role="radiogroup">
            <button aria-checked={tag === null} className={chip(tag === null)} onClick={() => setTag(null)} role="radio" type="button">
              כל התחומים
            </button>
            {availableTags.map((t) => (
              <button aria-checked={tag === t} className={chip(tag === t)} key={t} onClick={() => setTag(t)} role="radio" type="button">
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      <p aria-live="polite" className="mx-4 mt-6 text-meta text-ink-muted">
        {countLabel(results.length)}
      </p>

      {results.length > 0 ? (
        <ul className="mx-4 mt-3 flex flex-col gap-4">
          {results.map((d) => (
            <li key={d.host.id}>
              <HostCard entry={d} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mx-4 mt-3 flex flex-col items-center gap-4 rounded-card bg-surface px-4 py-8 text-center">
          <p className="text-body text-ink-muted">לא נמצאו מדריכים שמתאימים לחיפוש</p>
          <button
            className={`h-10 rounded-control bg-header-control px-4 text-meta font-semibold text-ink active:bg-line ${pressable}`}
            onClick={() => {
              setQuery("")
              setTag(null)
            }}
            type="button"
          >
            ניקוי החיפוש
          </button>
        </div>
      )}
    </main>
  )
}
