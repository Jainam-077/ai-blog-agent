"use client";

import { useId } from "react";

type AppLogoProps = {
  size?: number;
  className?: string;
};

/** Brand mark: gradient tile + pen — use in navbar and sidebar for consistency */
export function AppLogo({ size = 32, className }: AppLogoProps) {
  const gid = useId().replace(/:/g, "");
  const gradId = `logo-grad-${gid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="6" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill={`url(#${gradId})`} />
      <rect x="1" y="1" width="30" height="30" rx="9" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      <g transform="translate(8.25 7.5) scale(1.125)">
        <path
          d="M11 2l3 3-9 9H2v-3L11 2z"
          stroke="#fff"
          strokeWidth="1.35"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
}
