"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  href: string;
  label: string;
  iconName: string;
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="p-4 space-y-1">
      {items.map(({ href, label, iconName }) => {
        const isActive = pathname === href || (href !== "/loja/painel" && pathname.startsWith(href));
        // Resolução dinâmica do ícone importado da biblioteca
        const Icon = (Icons as any)[iconName] || Icons.HelpCircle;

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition",
              isActive 
                ? "bg-violet-500/10 text-violet-400 font-bold" 
                : "text-muted-foreground hover:bg-zinc-800/50 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4" /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
