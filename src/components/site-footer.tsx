import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <p className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
              <span aria-hidden>🇵🇭</span> Bantay El Niño
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Know the heat. Track the water. Protect your community.
              An open-data civic information service for the Philippines.
            </p>
            <p className="font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
              Live Monitor · 88 Provinces · 1,618 LGUs
            </p>
          </div>

          <div>
            <p className="font-mono text-[11px] font-semibold tracking-[0.1em] text-foreground uppercase">
              Dashboards
            </p>
            <ul className="mt-3 space-y-2 font-mono text-xs">
              <li>
                <Link href="/map" className="text-muted-foreground hover:text-foreground">
                  Live Map (MapLibre)
                </Link>
              </li>
              <li>
                <Link href="/area" className="text-muted-foreground hover:text-foreground">
                  Check My Area (88 Provinces)
                </Link>
              </li>
              <li>
                <Link href="/water" className="text-muted-foreground hover:text-foreground">
                  Water & Reservoirs
                </Link>
              </li>
              <li>
                <Link href="/agriculture" className="text-muted-foreground hover:text-foreground">
                  Agriculture & Crop Risk
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-[11px] font-semibold tracking-[0.1em] text-foreground uppercase">
              Alerts & Context
            </p>
            <ul className="mt-3 space-y-2 font-mono text-xs">
              <li>
                <Link href="/advisories" className="text-muted-foreground hover:text-foreground">
                  Official Advisories Feed
                </Link>
              </li>
              <li>
                <Link href="/history" className="text-muted-foreground hover:text-foreground">
                  Historical Episodes (1982–2024)
                </Link>
              </li>
              <li>
                <Link href="/learn" className="text-muted-foreground hover:text-foreground">
                  Understanding El Niño
                </Link>
              </li>
              <li>
                <Link href="/data" className="text-muted-foreground hover:text-foreground">
                  Data Sources & Methodology
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2 font-mono text-[10px] text-muted-foreground">
            <p className="font-semibold text-foreground uppercase">Architecture</p>
            <p>Zero-Subscription Civic Stack ($0/month):</p>
            <p>Next.js 16 · Tailwind v4 · MapLibre GL · Cloudflare Pages · Supabase PostGIS</p>
            <p className="pt-2 text-[9px] text-muted-foreground">
              Official bulletins from PAGASA, DA, NIA, MWSS, and DOH.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
