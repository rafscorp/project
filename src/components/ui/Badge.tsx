import { cn } from "@/lib/utils/cn";

const variants = {
  default: "bg-zinc-700/50 text-foreground/80",
  success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  danger: "bg-red-500/15 text-red-400 border border-red-500/30",
  info: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", variants[variant], className)}>
      {children}
    </span>
  );
}
