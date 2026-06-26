import { cn } from "@/lib/utils/cn";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

/** Botão reutilizável com variantes da marca Agury */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20",
      secondary: "bg-background text-foreground hover:bg-muted border border-border-subtle",
      ghost: "text-muted-foreground hover:text-foreground hover:bg-muted/50",
      danger: "bg-red-600 text-white hover:bg-red-500",
      outline: "border border-border-subtle text-foreground hover:border-blue-600/50 hover:text-blue-600",
    };
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2.5 text-sm",
      lg: "px-8 py-3.5 text-base",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
          "active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
