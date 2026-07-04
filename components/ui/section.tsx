import { cn } from "@/lib/utils";

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  variant?: "white" | "light" | "primary";
};

export function Section({
  className,
  variant = "white",
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        "px-4 py-16 md:py-24",
        variant === "white" && "bg-white",
        variant === "light" && "bg-rp-slate-50",
        variant === "primary" && "bg-rp-primary-900 text-white",
        className,
      )}
      {...props}
    />
  );
}
