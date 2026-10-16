import { useEffect, useRef, useState } from "react"
import { regionHref } from "./data"
import { discoveryRegions, regionEvents } from "./filters"
import { ChevronForwardIcon } from "./icons"
import { pressable } from "./ui"

const countLabel = (n: number) => (n === 1 ? "פעילות אחת" : `${n} פעילויות`)

/* Regions that have activities, each with its real count and a photo from one of its own activities. */
const regionCards = discoveryRegions
  .map((r) => {
    const items = regionEvents(r.id)
    return { ...r, count: items.length, image: items[0]?.image }
  })
  .filter((r) => r.count > 0)

/**
 * "לגלות פעילויות לפי אזור": compact photo cards in a horizontal rail (the next card peeks in); each opens that
 * region's vertical listing ("#/region/<id>"). The round button scrolls one card on.
 */
export default function RegionCarousel() {
  const railRef = useRef<HTMLUListElement>(null)
  const [atEnd, setAtEnd] = useState(false)

  const update = () => {
    const el = railRef.current
    if (!el) return
    // RTL: scrollLeft runs from 0 to negative values.
    setAtEnd(Math.abs(el.scrollLeft) + el.clientWidth >= el.scrollWidth - 1)
  }
  useEffect(() => {
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  const next = () => {
    const el = railRef.current
    const card = el?.querySelector("li")
    if (!el || !card) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    el.scrollBy({ left: -(card.getBoundingClientRect().width + 12), behavior: reduce ? "auto" : "smooth" })
  }

  if (regionCards.length === 0) return null

  return (
    <section aria-labelledby="regions-title" className="mx-4 rounded-feature bg-sand/50 py-4">
      <h2 className="px-4 text-title font-bold text-ink" id="regions-title">
        לגלות פעילויות לפי אזור
      </h2>
      <div className="relative mt-4">
        <ul
          aria-labelledby="regions-title"
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-4 px-4"
          onScroll={update}
          ref={railRef}
        >
          {regionCards.map((r) => (
            <li className="shrink-0 snap-start" key={r.id}>
              <a
                aria-label={`${r.label}: ${countLabel(r.count)}`}
                className={`relative flex aspect-[184/194] w-36 flex-col justify-end overflow-hidden rounded-card bg-sand p-3 text-white ${pressable}`}
                href={regionHref(r.id)}
              >
                {r.image && (
                  <img alt="" className="absolute inset-0 size-full object-cover" draggable={false} src={r.image} />
                )}
                <span className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <span className="relative text-title leading-tight font-bold">{r.label}</span>
                <span className="relative mt-1 text-meta text-white/90">{countLabel(r.count)}</span>
              </a>
            </li>
          ))}
        </ul>
        {!atEnd && (
          <button
            aria-label="אזורים נוספים"
            className={`absolute end-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-ink shadow-card active:bg-sand ${pressable}`}
            onClick={next}
            type="button"
          >
            <ChevronForwardIcon />
          </button>
        )}
      </div>
    </section>
  )
}
