"use client";

type BrandMarkProps = {
  size?: number;
  className?: string;
};

/**
 * Chat-bubble robot brand mark used in the navbar and sidebar.
 */
export function BrandMark({ size = 32, className }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="bot-bg" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0B1220" />
          <stop offset="1" stopColor="#05070F" />
        </linearGradient>
        <linearGradient id="eye-glow" x1="22" y1="29" x2="42" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818CF8" />
          <stop offset="1" stopColor="#60A5FA" />
        </linearGradient>
      </defs>

      <rect x="1" y="1" width="62" height="62" rx="18" fill="url(#bot-bg)" />
      <rect x="1" y="1" width="62" height="62" rx="18" fill="none" stroke="rgba(255,255,255,0.12)" />

      <rect x="19" y="16" width="26" height="5" rx="2.5" fill="#E2E8F0" />
      <circle cx="32" cy="12.3" r="2.4" fill="#A5B4FC" />
      <path d="M32 13.3V16" stroke="#E2E8F0" strokeWidth="1.6" strokeLinecap="round" />

      <rect x="12" y="20" width="40" height="30" rx="11" fill="#F8FAFC" />
      <rect x="16.5" y="25" width="31" height="14" rx="7" fill="#0F172A" />
      <circle cx="26" cy="32" r="2.8" fill="url(#eye-glow)" />
      <circle cx="38" cy="32" r="2.8" fill="url(#eye-glow)" />
      <path d="M24 42c2.6 2.4 13.4 2.4 16 0" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
