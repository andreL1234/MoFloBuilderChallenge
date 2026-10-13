"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useKnowledge } from "@/context/KnowledgeContext";

const links = [
  { href: "/knowledge", label: "Build", shortLabel: "Build" },
  { href: "/knowledge/view", label: "Knowledge Bases", shortLabel: "Library" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const { knowledgeList, isHydrated } = useKnowledge();

  const isActive = (href: string) =>
    href === "/knowledge" ? pathname === "/knowledge" : pathname.startsWith(href);

  return (
    <header className="absolute inset-x-0 top-0 z-30 px-4 pt-5">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-white/15 bg-white/5 py-2 pr-2 pl-5 backdrop-blur-md">
        <Link href="/knowledge" className="font-display text-lg font-semibold tracking-tight text-white">
          MoKnowledge
        </Link>

        <div className="flex items-center gap-2">
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all sm:px-4 ${
                  active
                    ? "bg-brand-600 text-white shadow-[0_8px_20px_-8px_rgba(38,99,235,0.9)]"
                    : "bg-white text-brand-600 hover:bg-brand-50"
                }`}
              >
                <span className={`hidden h-1.5 w-1.5 rounded-full sm:block ${active ? "bg-white" : "bg-brand-600"}`} />
                <span className="sm:hidden">{link.shortLabel}</span>
                <span className="hidden sm:inline">{link.label}</span>
                {link.href === "/knowledge/view" && isHydrated && knowledgeList.length > 0 && (
                  <span
                    className={`rounded-full px-1.5 text-xs tabular-nums ${
                      active ? "bg-white/20 text-white" : "bg-brand-50 text-brand-700"
                    }`}
                  >
                    {knowledgeList.length}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
