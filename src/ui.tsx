import type { ReactNode } from "react"
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
