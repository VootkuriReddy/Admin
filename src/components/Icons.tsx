import type { ComponentType, ReactElement, SVGProps } from "react";

// Every console icon: stroke-outline SVG, currentColor, sized via `size`.
export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export type IconComponent = ComponentType<IconProps>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const Svg = ({
  size = 20,
  className = "",
  viewBox = "0 0 24 24",
  children,
  ...rest
}: IconProps): ReactElement => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox={viewBox}
    className={className}
    aria-hidden="true"
    {...base}
    {...rest}
  >
    {children}
  </svg>
);

export const IconMenu = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Svg>
);

export const IconBell = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 5a2 2 0 0 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6M9 17v1a3 3 0 0 0 6 0v-1" />
  </Svg>
);

export const IconX = (p: IconProps) => (
  <Svg {...p}>
    <path d="M18 6l-12 12M6 6l12 12" />
  </Svg>
);

export const IconDashboard = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 4h16v16H4zM4 9h16M4 15h16M10 9v11M15 9v11" />
  </Svg>
);

export const IconUserPlus = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10" cy="8" r="4" />
    <path d="M3 21v-1a6 6 0 0 1 6 -6h2a6 6 0 0 1 6 6v1M19 8v6M22 11h-6" />
  </Svg>
);

export const IconUsers = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="7" r="4" />
    <path d="M2 20v-2a5 5 0 0 1 5 -5h4a5 5 0 0 1 5 5v2M16 4a4 4 0 1 0 0 8M17.5 14a5 5 0 0 1 4 5v1" />
  </Svg>
);

export const IconScale = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 4v16M8 20h8M12 6L5 8m7-2l7 2M5 8l-3 6a3.5 3.5 0 0 0 6 0zM19 8l-3 6a3.5 3.5 0 0 0 6 0zM7 8a2 2 0 1 0 8 0" />
  </Svg>
);

export const IconRefresh = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 12a8 8 0 1 1 -2.3 -5.6M20 3v4h-4" />
  </Svg>
);

export const IconPaperPlane = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 3L3 10.5l7 3M21 3l-6 18-4.5-7.5M21 3L10 13.5" />
  </Svg>
);

export const IconLogout = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 8V6a2 2 0 0 0 -2 -2H6a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2 -2v-2M9 12h12l-3 -3M18 15l3 -3" />
  </Svg>
);

export const IconChevronDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 9l6 6 6-6" />
  </Svg>
);

export const IconAlertTriangle = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 4.5l9 15.5H3L12 4.5zM12 10v4M12 16.5h.01" />
  </Svg>
);

export const IconClock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);

export const IconCalendarDays = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 5h16a1 1 0 0 1 1 1v13a1 1 0 0 1 -1 1H4a1 1 0 0 1 -1 -1V6a1 1 0 0 1 1 -1zM4 10h16M9 4v2M15 4v2" />
  </Svg>
);

export const IconKey = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="8" cy="15" r="4" />
    <path d="M10.8 12.2L20 3m-4 1l3 3m-6 0l3 3" />
  </Svg>
);

export const IconUser = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="7.5" r="3.5" />
    <path d="M5 20.5c1-3.2 3.7-4.8 7-4.8s6 1.6 7 4.8" />
  </Svg>
);

export const IconMail = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 6a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1H4a1 1 0 0 1 -1 -1V6zM3.5 6.5L12 13l8.5 -6.5" />
  </Svg>
);

export const IconBadge = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="6" width="14" height="12" />
    <path d="M17 9h4v6h-4M6.5 10h2M6.5 13h4" />
  </Svg>
);

export const IconInfo = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </Svg>
);
