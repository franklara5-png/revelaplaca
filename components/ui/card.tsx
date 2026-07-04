import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("rp-card p-6 transition-shadow duration-200", className)}
      {...props}
    />
  );
}
