import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/site-url";

type Props = {
  variant?: "full" | "icon";
  className?: string;
  textClassName?: string;
};

export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 44 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-7 w-11 shrink-0", className)}
      aria-hidden
    >
      <rect
        x="1"
        y="1"
        width="34"
        height="24"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect x="1" y="1" width="34" height="7" rx="4" fill="currentColor" opacity="0.15" />
      <clipPath id="rp-lens-reveal">
        <circle cx="30" cy="19" r="8" />
      </clipPath>
      <g clipPath="url(#rp-lens-reveal)">
        <rect x="1" y="1" width="34" height="24" rx="4" fill="currentColor" opacity="0.4" />
        <rect x="1" y="1" width="34" height="7" rx="4" fill="currentColor" opacity="0.55" />
      </g>
      <circle
        cx="30"
        cy="19"
        r="8"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M36 25L41 28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ variant = "full", className, textClassName }: Props) {
  if (variant === "icon") {
    return <LogoIcon className={className} />;
  }

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoIcon className="text-rp-primary" />
      <span className={cn("font-bold tracking-tight text-rp-ink", textClassName)}>
        {SITE_NAME}
      </span>
    </span>
  );
}
