import { cn } from "@/lib/utils/cn";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  successMessage?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, successMessage, id, ...props }, ref) => {
    const inputId = id ?? (props.name ? `${props.name}-field` : undefined);
    const hasFeedback = Boolean(error || successMessage);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-foreground/80">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-2xl border border-zinc-700/80 bg-background/80 px-4 py-3 pr-10 text-foreground shadow-sm",
              "placeholder:text-muted-foreground transition-all duration-200",
              "focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              !error && successMessage && "border-emerald-500/60 focus:border-emerald-500 focus:ring-emerald-500/20",
              className
            )}
            {...props}
          />
          {hasFeedback && (
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              {error ? (
                <AlertCircle className="h-4 w-4 text-red-400" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              )}
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-400">{error}</p>
        ) : successMessage ? (
          <p className="mt-1.5 text-sm text-emerald-400">{successMessage}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";
