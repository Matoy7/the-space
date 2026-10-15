import type { ReactNode } from "react"
import { badgeLabel, priceLabel, type SiteEvent } from "./data"
import { useFavorite } from "./favorites"
import { ChevronForwardIcon, HeartIcon } from "./icons"

export const pressable = "transition-[background-color,transform] duration-150 active:scale-[0.97]"

type FavoriteTone = "overlay" | "light" | "compact"

/**
 * Heart toggle backed by the shared favourites store.
 * - overlay: dark glass chip on photos (home cards)
 * - light: white chip with ink icon (event page hero)
 * - compact: small white chip for small cards (32px visual, 40px tap area)
 */
export function FavoriteButton({
  id,
  className = "",
  tone = "overlay",
}: {
  id: string
  className?: string
  tone?: FavoriteTone
}) {
  const [saved, toggle] = useFavorite(id)
  const base =
    "flex items-center justify-center rounded-control backdrop-blur-sm transition-[background-color,color,transform] duration-200 active:scale-90"
  const size = tone === "compact" ? "size-8 before:absolute before:-inset-1 before:content-['']" : "size-10"
  const colours =
    tone === "overlay"
      ? saved
        ? "bg-white/90 text-accent"
        : "bg-black/30 text-white active:bg-black/45"
      : saved
        ? "bg-white/90 text-accent"
        : "bg-white/90 text-ink active:bg-white"
  return (
    <button
      aria-label="שמור למועדפים"
      aria-pressed={saved}
      className={`${base} ${size} ${colours} ${className}`}
      onClick={(e) => {
        e.stopPropagation()
        toggle()
      }}
      type="button"
    >
      <HeartIcon fill={saved ? "currentColor" : "none"} size={tone === "compact" ? 16 : tone === "light" ? 20 : 18} />
    </button>
  )
}

/** Primary pill (terracotta). Renders a link when `href` is given. */
export function PrimaryButton({ children, href }: { children: ReactNode; href?: string }) {
  const className = `inline-flex h-10 shrink-0 items-center gap-1 rounded-control bg-accent ps-4 pe-3 text-meta font-semibold text-white active:bg-accent-pressed ${pressable}`
  const content = (
    <>
      {children}
      <ChevronForwardIcon size={16} />
    </>
  )
  return href ? (
    <a className={className} href={href}>
      {content}
    </a>
  ) : (
    <button className={className} type="button">
      {content}
    </button>
  )
}

export function MetaItem({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      {icon}
      <span>{children}</span>
    </span>
  )
}

/** Section title with a trailing text action (a link when `actionHref` is given). */
export function SectionHeader({
  title,
  actionLabel = "הצג הכל",
  actionHref,
  className = "px-4",
}: {
  title: string
  actionLabel?: string
  actionHref?: string
  className?: string
}) {
  const actionClass =
    "-me-2 inline-flex h-10 shrink-0 items-center gap-1 rounded-control px-2 text-meta font-semibold text-accent transition-colors active:bg-sand"
  return (
    <header className={`flex items-center justify-between gap-4 ${className}`}>
      <h2 className="text-heading font-bold text-ink">{title}</h2>
      {actionHref ? (
        <a className={actionClass} href={actionHref}>
          {actionLabel}
          <ChevronForwardIcon size={16} />
        </a>
      ) : (
        <button className={actionClass} type="button">
          {actionLabel}
          <ChevronForwardIcon size={16} />
        </button>
      )}
    </header>
  )
}

/* ---------- Event-card building blocks shared by every card type ---------- */

/**
 * Date pill on a card photo (top-left in RTL, no icon). Renders nothing when the event has no valid date.
 * `inset` sets the distance from the photo edges (8px on cards, 16px on the large carousel card).
 */
export function DateBadge({ event, inset = "end-2 top-2" }: { event: SiteEvent; inset?: string }) {
  const label = badgeLabel(event)
  if (!label) return null
  return (
    <span
      className={`pointer-events-none absolute z-[1] flex h-8 items-center rounded-control bg-surface/90 px-3 text-meta font-semibold whitespace-nowrap text-ink shadow-sm backdrop-blur-sm ${inset}`}
    >
      {label}
    </span>
  )
}

type RegistrationState = "open" | "closed" | "full" | "unavailable"

/** The one place that decides how an event can be registered for. */
export function registrationState(event: SiteEvent): RegistrationState {
  if (event.registrationStatus) return event.registrationStatus
  return event.registrationUrl ? "open" : "unavailable"
}

const registrationLabels: Record<RegistrationState, string> = {
  open: "להרשמה",
  closed: "ההרשמה סגורה",
  full: "אזלו המקומות",
  unavailable: "הרשמה בקרוב",
}

/**
 * Registration action for a specific event.
 * - open: terracotta link to the event's own registration URL (new tab)
 * - closed / full / unavailable (no registration data yet): disabled, with the status as its label
 * Sits above a card's stretched link (z-[1]), so tapping it never opens the card.
 */
export function RegisterButton({
  event,
  variant = "card",
  className = "",
}: {
  event: SiteEvent
  variant?: "card" | "overlay" | "bar"
  className?: string
}) {
  const state = registrationState(event)
  const label = registrationLabels[state]
  const size =
    variant === "bar" ? "h-12 w-46 text-body" : "h-10 px-4 text-meta"
  const base = `relative z-[1] inline-flex shrink-0 items-center justify-center rounded-control font-semibold whitespace-nowrap ${size} ${className}`
  if (state === "open") {
    return (
      <a
        aria-label={`להרשמה: ${event.title}`}
        className={`${base} bg-accent text-white active:bg-accent-pressed ${pressable}`}
        href={event.registrationUrl}
        onClick={(e) => e.stopPropagation()}
        rel="noopener noreferrer"
        target="_blank"
      >
        {label}
      </a>
    )
  }
  const muted = variant === "overlay" ? "bg-white/85 text-ink-muted" : "bg-sand text-ink-muted"
  return (
    <button aria-label={`${label}: ${event.title}`} className={`${base} cursor-not-allowed ${muted}`} disabled type="button">
      {label}
    </button>
  )
}

/** Fixed event price for the bottom of a card; renders nothing when the event has no price. */
export function PriceTag({ event, tone = "card", className = "" }: { event: SiteEvent; tone?: "card" | "overlay"; className?: string }) {
  const label = priceLabel(event)
  if (!label) return null
  return (
    <span
      aria-label={`מחיר: ${label}`}
      className={`shrink-0 text-title font-bold whitespace-nowrap ${tone === "overlay" ? "text-white" : "text-ink"} ${className}`}
    >
      {label}
    </span>
  )
}
