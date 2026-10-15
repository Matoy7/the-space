import type { SiteEvent } from "./data"
import { ChevronForwardIcon } from "./icons"

export const pressable = "transition-[background-color,transform] duration-150 active:scale-[0.97]"

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
 * Registration action for a specific event, in the olive treatment of the card reference.
 * - open: link to the event's own registration URL (new tab)
 * - closed / full / unavailable (no registration data yet): disabled, with the status as its label
 * Sits above a card's stretched link (z-[1]), so tapping it never opens the card.
 */
export function RegisterButton({
  event,
  variant = "card",
  className = "",
}: {
  event: SiteEvent
  variant?: "card" | "bar"
  className?: string
}) {
  const state = registrationState(event)
  const label = registrationLabels[state]
  const size =
    variant === "bar" ? "h-12 w-46 text-body" : "h-10 px-4 text-meta"
  const base = `relative z-[1] inline-flex shrink-0 items-center justify-center rounded-control bg-olive font-medium whitespace-nowrap text-white ${size} ${className}`
  if (state === "open") {
    return (
      <a
        aria-label={`להרשמה: ${event.title}`}
        className={`${base} active:bg-olive-pressed ${pressable}`}
        href={event.registrationUrl}
        onClick={(e) => e.stopPropagation()}
        rel="noopener noreferrer"
        target="_blank"
      >
        {label}
      </a>
    )
  }
  return (
    <button aria-label={`${label}: ${event.title}`} className={`${base} cursor-not-allowed`} disabled type="button">
      {label}
    </button>
  )
}
