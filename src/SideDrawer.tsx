import { useEffect, useId, useRef } from "react"
import { CloseIcon } from "./icons"
import { trapTab, useModal } from "./useModal"

const logoSrc = `${import.meta.env.BASE_URL}assets/77585.png`

type NavItem = { label: string; target?: string }

/* Primary navigation. Items without a target have no destination on the site yet and render as "בקרוב". */
const primaryNav: NavItem[] = [
  { label: "אירועים וסדנאות", target: "events" },
  { label: "תרגולים שבועיים" },
  { label: "ריטריטים", target: "retreats" },
]

function ComingSoon() {
  return (
    <span className="rounded-control bg-sand px-2 text-meta font-medium text-ink-muted">בקרוב</span>
  )
}

/* Secondary links: pages of the site (hash routes). */
const secondaryNav = [
  { label: "אודות המרחב", href: "#/about", page: "about" },
  { label: "יצירת קשר", href: "#/contact", page: "contact" },
] as const

export default function SideDrawer({
  open,
  onClose,
  returnFocusTo,
  current = "home",
}: {
  open: boolean
  onClose: () => void
  returnFocusTo: React.RefObject<HTMLElement | null>
  /** Page currently shown, for the active state of page links. */
  current?: "home" | "about" | "contact" | "listing"
}) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  // Section to scroll to once the drawer has closed and page scrolling is unlocked.
  const pendingTarget = useRef<string | null>(null)
  useModal(open, closeRef, returnFocusTo)

  // After the drawer has closed (scroll unlocked, focus restored), jump to the chosen section.
  useEffect(() => {
    if (open || !pendingTarget.current) return
    const target = pendingTarget.current
    pendingTarget.current = null
    // A page link ("#/about") is a route change.
    if (target.startsWith("#/")) {
      if (window.location.hash !== target) window.location.hash = target
      return
    }
    const section = document.getElementById(target)
    // Not on the home page (e.g. on About): go home, where the router scrolls to the section.
    if (!section) {
      window.location.hash = `#${target}`
      return
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    section.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
    history.replaceState(null, "", `#${target}`)
  }, [open])

  // Escape closes; Tab stays inside the drawer while it is open.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation()
      onClose()
      return
    }
    trapTab(e, panelRef.current)
  }

  const navigate = (e: React.MouseEvent, target: string) => {
    e.preventDefault()
    pendingTarget.current = target
    onClose()
  }

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      inert={!open}
      onKeyDown={onKeyDown}
    >
      {/* Backdrop: full viewport (header included); tap closes. Keyboard users close via X or Escape. */}
      <button
        aria-label="סגירת התפריט"
        className={`absolute inset-0 size-full cursor-default bg-black/45 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        tabIndex={-1}
        type="button"
      />

      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className={`absolute inset-y-0 start-0 flex w-[80vw] max-w-[360px] flex-col overflow-y-auto overscroll-contain bg-surface pt-[env(safe-area-inset-top)] pb-[calc(env(safe-area-inset-bottom)+32px)] transition-transform duration-300 ease-out motion-reduce:transition-none ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        id="site-drawer"
        ref={panelRef}
        role="dialog"
      >
        <div className="flex h-16 shrink-0 items-center justify-between ps-6 pe-4">
          <h2 className="m-0" id={titleId}>
            <img alt="המרחב" className="h-10 w-auto" height={40} src={logoSrc} width={121} />
          </h2>
          <button
            aria-label="סגירה"
            className="flex size-10 items-center justify-center rounded-control bg-header-control text-ink transition-[background-color,transform] duration-150 active:scale-[0.97] active:bg-line"
            onClick={onClose}
            ref={closeRef}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>

        <nav aria-label="ניווט ראשי" className="mt-6 px-6">
          <ul>
            {primaryNav.map((item) => (
              <li key={item.label}>
                {item.target ? (
                  <a
                    className="flex h-14 items-center text-heading font-semibold text-ink transition-colors active:text-accent"
                    href={`#${item.target}`}
                    onClick={(e) => navigate(e, item.target!)}
                  >
                    {item.label}
                  </a>
                ) : (
                  <span aria-disabled="true" className="flex h-14 items-center gap-2 text-heading font-semibold text-ink/40">
                    {item.label}
                    <ComingSoon />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <section aria-labelledby={`${titleId}-guides`} className="mx-6 mt-8 border-t border-ink/10 pt-8">
          <h3 className="text-meta font-medium text-ink-muted" id={`${titleId}-guides`}>
            למדריכים
          </h3>
          {/* No submission flow exists yet, so the action is shown but not interactive. */}
          <p aria-disabled="true" className="mt-2 flex items-center gap-2 text-title font-semibold text-ink/40">
            פרסום פעילות חדשה
            <ComingSoon />
          </p>
        </section>

        <nav aria-label="קישורים נוספים" className="mx-6 mt-8 border-t border-ink/10 pt-6">
          <ul>
            {secondaryNav.map((item) => {
              const active = current === item.page
              return (
                <li key={item.href}>
                  <a
                    aria-current={active ? "page" : undefined}
                    className={`flex h-12 items-center text-title font-semibold transition-colors active:text-accent ${
                      active ? "text-accent" : "text-ink"
                    }`}
                    href={item.href}
                    onClick={(e) => navigate(e, item.href)}
                  >
                    {item.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}
