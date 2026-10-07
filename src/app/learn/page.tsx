import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "What is El Niño, why does it happen, and how does it affect the Philippines?",
};

const STEPS = [
  { n: "01", text: "Pacific Ocean temperatures change" },
  { n: "02", text: "Atmospheric circulation changes" },
  { n: "03", text: "Rainfall patterns shift" },
  {
    n: "04",
    text: "The Philippines can experience hotter and/or drier conditions",
  },
];

const HISTORICAL_EVENTS = [
  "1982–83",
  "1997–98",
  "2009–10",
  "2015–16",
  "2023–24",
];

const HOUSEHOLD_ACTIONS = [
  "Conserve water in daily routines",
  "Limit prolonged heat exposure",
  "Check on elderly and vulnerable family members",
];

const FARMER_ACTIONS = [
  "Monitor soil moisture regularly",
  "Manage irrigation carefully",
  "Follow local agricultural advisories",
];

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <p className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
        Learn
      </p>
      <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Understanding El Niño
      </h1>

      {/* What is El Niño: the blueprint's four-step flow (§13) */}
      <section className="mt-10" aria-labelledby="what-heading">
        <h2
          id="what-heading"
          className="font-heading text-2xl font-semibold text-foreground"
        >
          What is El Niño?
        </h2>
        <ol className="mt-5 border-t border-border">
          {STEPS.map((step, index) => (
            <li key={step.n}>
              <div className="grid gap-1 border-b border-border py-4 sm:grid-cols-[3rem_1fr] sm:gap-6">
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {step.n}
                </span>
                <p className="text-sm font-medium leading-relaxed text-foreground">
                  {step.text}
                </p>
              </div>
              {index < STEPS.length - 1 ? (
                <p
                  className="py-1 text-center font-mono text-xs text-muted-foreground"
                  aria-hidden
                >
                  ↓
                </p>
              ) : null}
            </li>
          ))}
        </ol>

        <div className="mt-6 border border-border bg-card p-6">
          <p className="font-heading text-lg font-semibold text-risk-high">
            El Niño ≠ simply “hot weather.”
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            El Niño is a shift in ocean and atmospheric conditions across the
            Pacific that changes rainfall patterns worldwide. Heat is one
            symptom. Delayed or reduced rainfall is often the bigger impact for
            the Philippines.
          </p>
        </div>
      </section>

      {/* Why does it happen */}
      <section className="mt-10" aria-labelledby="why-heading">
        <h2
          id="why-heading"
          className="font-heading text-2xl font-semibold text-foreground"
        >
          Why does it happen?
        </h2>
        <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            Normally, trade winds blow warm surface water toward the western
            Pacific, keeping warm water pooled near the Philippines and
            Indonesia.
          </p>
          <p>
            During El Niño, those winds weaken. Warm water spreads eastward
            across the central and eastern Pacific, and the atmosphere
            reorganizes with it. The result: rainfall that would normally fall
            over the western Pacific shifts away from the Philippines.
          </p>
        </div>
      </section>

      {/* Philippines and El Niño */}
      <section className="mt-10" aria-labelledby="ph-heading">
        <h2
          id="ph-heading"
          className="font-heading text-2xl font-semibold text-foreground"
        >
          The Philippines and El Niño
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          The Philippines is one of the countries most affected by El Niño.
          Significant events have caused delayed rainfall onsets, dry spells,
          water shortages, and agricultural losses across many provinces.
        </p>

        <div className="mt-5">
          <p className="font-mono text-[10px] font-medium tracking-[0.1em] text-muted-foreground uppercase">
            El Niño through the years
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {HISTORICAL_EVENTS.map((year) => (
              <span
                key={year}
                className="border border-border bg-card px-2.5 py-1 font-mono text-xs font-medium tabular-nums text-foreground"
              >
                {year}
              </span>
            ))}
            <span className="border border-foreground bg-foreground px-2.5 py-1 font-mono text-xs font-medium text-background">
              Current
            </span>
          </div>
        </div>
      </section>

      {/* What can I do */}
      <section className="mt-10 pb-6" aria-labelledby="do-heading">
        <h2
          id="do-heading"
          className="font-heading text-2xl font-semibold text-foreground"
        >
          What can I do?
        </h2>
        <div className="mt-4 grid gap-px border border-border bg-border sm:grid-cols-2">
          <div className="bg-card p-5">
            <h3 className="font-mono text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
              At home
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-foreground">
              {HOUSEHOLD_ACTIONS.map((action) => (
                <li key={action} className="flex gap-2">
                  <span aria-hidden className="text-muted-foreground">
                    ·
                  </span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card p-5">
            <h3 className="font-mono text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
              On the farm
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-foreground">
              {FARMER_ACTIONS.map((action) => (
                <li key={action} className="flex gap-2">
                  <span aria-hidden className="text-muted-foreground">
                    ·
                  </span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
