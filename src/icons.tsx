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

export const HeartIcon = createIcon(
  <path d="M19.4 5.6a5 5 0 0 0-7.1 0L12 6l-.3-.4a5 5 0 0 0-7.1 7.1L12 20l7.4-7.3a5 5 0 0 0 0-7.1Z" />,
)

export const MenuIcon = createIcon(<path d="M4 7h16M4 12h16M4 17h16" />)

export const ChevronDownIcon = createIcon(<path d="m7 10 5 5 5-5" />)

/** "Forward" in an RTL interface points left. */
export const ChevronForwardIcon = createIcon(<path d="m14 7-5 5 5 5" />)
