import { cn } from "@/lib/utils/cn";
import { LucideIcon } from "lucide-react";

interface StatsProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function Stats({ label, value, icon: Icon, trend, className }: StatsProps) {
  return (
    <div className={cn("rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-400">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-zinc-500" />}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="font-display text-2xl font-bold text-white">{value}</p>
        {trend && (
          <span className={cn(
            "text-xs font-medium",
            trend.isPositive ? "text-emerald-400" : "text-red-400"
          )}>
            {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  );
}
