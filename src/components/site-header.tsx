"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Database,
  Droplets,
  History,
  LayoutGrid,
  MapPin,
  Newspaper,
  Radar,
  Wheat,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Full platform navigation (blueprint §1 & §16).
 * Icons repeat the label, never replace it (R-04 relevance recorded in DESIGN.md). */
const DESKTOP_NAV_ITEMS: NavItem[] = [
  { href: "/map", label: "Live Map", icon: Radar },
  { href: "/area", label: "My Area", icon: MapPin },
  { href: "/water", label: "Water", icon: Droplets },
  { href: "/agriculture", label: "Agriculture", icon: Wheat },
  { href: "/advisories", label: "Advisories", icon: Newspaper },
  { href: "/history", label: "History", icon: History },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/data", label: "Data", icon: Database },
];

const MOBILE_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: LayoutGrid },
  { href: "/map", label: "Map", icon: Radar },
  { href: "/area", label: "Area", icon: MapPin },
  { href: "/water", label: "Water", icon: Droplets },
  { href: "/advisories", label: "Alerts", icon: Newspaper },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/" className="flex h-14 shrink-0 items-center gap-2">
            <span className="font-heading text-lg font-semibold leading-none text-foreground">
              Bantay El Niño
            </span>
          </Link>

          <nav
            className="hidden h-full items-stretch gap-4 md:flex lg:gap-5"
            aria-label="Main"
          >
            {DESKTOP_NAV_ITEMS.map(({ href, label }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-full items-center border-b-2 font-mono text-[11px] font-medium uppercase tracking-[0.08em] transition-colors ${
                    active
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <span className="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground md:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden />
            Live Monitor · 88 Provinces
          </span>
        </div>
      </header>

      {/* Mobile bottom bar (blueprint §16). 56px cells clear the 44px
          tap-target minimum (R-03). */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Main (mobile)"
      >
        {MOBILE_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-1 border-t-2 font-mono text-[9px] font-medium uppercase tracking-[0.06em] ${
                active
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
