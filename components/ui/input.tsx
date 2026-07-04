import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-13 w-full rounded-2xl border border-rp-slate-100 bg-white px-4 text-lg font-semibold uppercase tracking-widest text-rp-slate-900 placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-rp-slate-400 focus:border-rp-primary-500 focus:outline-none focus:ring-2 focus:ring-rp-primary-500/20",
        className,
      )}
      {...props}
    />
  );
}
