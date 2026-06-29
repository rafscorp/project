"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="p-4 space-y-1">
      {items.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== "/loja/painel" && pathname.startsWith(href));
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
