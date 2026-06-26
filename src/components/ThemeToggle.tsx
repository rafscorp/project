"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/Button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 p-0 rounded-full border-none bg-violet-700 dark:bg-zinc-800 transition-colors shadow-lg">
        <span className="sr-only">Carregando tema</span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 p-0 rounded-full border-none bg-violet-700 hover:bg-violet-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors shadow-lg hover:scale-105 duration-200"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {/* SVG Sol */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 sm:h-7 sm:w-7 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-white"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>
      {/* SVG Lua */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute h-6 w-6 sm:h-7 sm:w-7 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-300"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
