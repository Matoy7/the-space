import type { ReactNode, SVGProps } from "react"

/**
 * Single icon system: 24px grid, 1.75 stroke, colour inherited from text (currentColor).
 * Size is set per use via the `size` prop (16 for inline metadata, 20 for controls).
 */
type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & { size?: number }

function createIcon(paths: ReactNode) {
  return function Icon({ size = 20, ...props }: IconProps) {
    return (
      <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        viewBox="0 0 24 24"
        width={size}
        {...props}
        className={`block shrink-0 ${props.className ?? ""}`}
      >
        {paths}
      </svg>
    )
  }
}

export const MapPinIcon = createIcon(
  <>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </>,
)

export const CalendarIcon = createIcon(
  <>
    <rect height="17" rx="2" width="18" x="3" y="4.5" />
    <path d="M8 2.5v4M16 2.5v4M3 10h18" />
  </>,
)

/** Funnel: opens the filter sheet. */
export const FilterIcon = createIcon(<path d="M4 5h16l-6 7.5V18l-4 2v-7.5L4 5Z" />)

export const MenuIcon = createIcon(<path d="M4 7h16M4 12h16M4 17h16" />)

export const ChevronDownIcon = createIcon(<path d="m7 10 5 5 5-5" />)

/** "Forward" in an RTL interface points left. */
export const ChevronForwardIcon = createIcon(<path d="m14 7-5 5 5 5" />)

export const BellIcon = createIcon(
  <>
    <path d="M6 9a6 6 0 0 1 12 0c0 6.5 2.5 8 2.5 8h-17S6 15.5 6 9Z" />
    <path d="M10.3 20.5a1.9 1.9 0 0 0 3.4 0" />
  </>,
)

export const CloseIcon = createIcon(<path d="M6 6l12 12M18 6 6 18" />)

/** "Back" in an RTL interface points right. */
export const ChevronBackIcon = createIcon(<path d="m10 7 5 5-5 5" />)

export const ShareIcon = createIcon(
  <>
    <path d="M12 15V3.5M7.5 8 12 3.5 16.5 8" />
    <path d="M8 11H6.5A1.5 1.5 0 0 0 5 12.5v7A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-7a1.5 1.5 0 0 0-1.5-1.5H16" />
  </>,
)

export const TagIcon = createIcon(
  <>
    <path d="M3.5 12.6V4.5a1 1 0 0 1 1-1h8.1a1 1 0 0 1 .7.3l7.4 7.4a1 1 0 0 1 0 1.4l-8.1 8.1a1 1 0 0 1-1.4 0l-7.4-7.4a1 1 0 0 1-.3-.7Z" />
    <circle cx="8.5" cy="8.5" r="1.5" />
  </>,
)
