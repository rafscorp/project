import { useState, forwardRef } from "react";
import { Input } from "./Input";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type PasswordStrength = "weak" | "medium" | "strong";

export const evaluatePassword = (password: string): PasswordStrength => {
  if (password.length < 6) return "weak";
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  
  const score = (hasLetters ? 1 : 0) + (hasNumbers ? 1 : 0) + (hasSpecial ? 1 : 0) + (password.length >= 8 ? 1 : 0);
  
  if (score <= 1) return "weak";
  if (score === 2 || score === 3) return "medium";
  return "strong";
};

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  onStrengthChange?: (strength: PasswordStrength) => void;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, onChange, value, ...props }, ref) => {
    const pwd = (value as string) || "";
    const strength = evaluatePassword(pwd);

    const getStrengthColor = () => {
      if (!pwd) return "bg-zinc-800";
      if (strength === "weak") return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]";
      if (strength === "medium") return "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]";
      return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]";
    };
    
    const getLabelText = () => {
      if (!pwd) return "Força da senha";
      if (strength === "weak") return "Fraca";
      if (strength === "medium") return "Razoável";
      return "Forte";
    };

    return (
      <div className="w-full">
        <Input
          ref={ref}
          type="password"
          value={value}
          onChange={(e) => {
            if (onChange) onChange(e);
            if (props.onStrengthChange) props.onStrengthChange(evaluatePassword(e.target.value));
          }}
          className={cn(className)}
          {...props}
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="flex flex-1 h-1.5 gap-1 mr-4">
            <div className={cn("h-full flex-1 rounded-full transition-all duration-300", pwd ? getStrengthColor() : "bg-zinc-800")} />
            <div className={cn("h-full flex-1 rounded-full transition-all duration-300", pwd && strength !== "weak" ? getStrengthColor() : "bg-zinc-800")} />
            <div className={cn("h-full flex-1 rounded-full transition-all duration-300", pwd && strength === "strong" ? getStrengthColor() : "bg-zinc-800")} />
          </div>
          <span className={cn(
            "text-[11px] font-bold uppercase tracking-wider",
            !pwd ? "text-zinc-600" :
            strength === "weak" ? "text-red-400" : 
            strength === "medium" ? "text-amber-400" : "text-emerald-400"
          )}>
            {getLabelText()}
          </span>
        </div>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
