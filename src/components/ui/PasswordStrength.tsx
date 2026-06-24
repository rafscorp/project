import { checkPasswordStrength } from "@/lib/auth/password";
import { cn } from "@/lib/utils/cn";

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const { score, label, suggestions } = checkPasswordStrength(password);

  const colors = {
    0: "bg-red-500",
    1: "bg-orange-500",
    2: "bg-amber-400",
    3: "bg-emerald-400",
    4: "bg-emerald-500",
  };

  const textColors = {
    0: "text-red-400",
    1: "text-orange-400",
    2: "text-amber-400",
    3: "text-emerald-400",
    4: "text-emerald-500",
  };

  const labels = {
    0: "Muito Fraca",
    1: "Fraca",
    2: "Razoável",
    3: "Forte",
    4: "Muito Forte",
  };

  return (
    <div className="mt-2 space-y-2 animate-fade-in">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400">Força da senha:</span>
        <span className={cn("font-medium", textColors[score])}>{labels[score]}</span>
      </div>
      <div className="flex gap-1 h-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "h-full flex-1 rounded-full transition-colors duration-300",
              i <= score ? colors[score] : "bg-zinc-800"
            )}
          />
        ))}
      </div>
      {suggestions.length > 0 && (
        <ul className="text-xs text-zinc-500 list-disc list-inside mt-2">
          {suggestions.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      )}
    </div>
  );
}
