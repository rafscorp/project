"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface TabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex space-x-1 rounded-xl bg-panel/50 p-1", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200",
            activeTab === tab.id
              ? "bg-zinc-800 text-white shadow"
              : "text-muted-foreground hover:bg-zinc-800/50 hover:text-white"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
