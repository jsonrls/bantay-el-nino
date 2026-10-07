import { riskMeta, type RiskLevel } from "@/lib/types";

interface RiskBadgeProps {
  level: RiskLevel;
  /** Override the default label, for example "High El Niño Impact". */
  label?: string;
  className?: string;
}

/**
 * Severity tag: sharp rectangle, mono label, square state dot. No capsule,
 * no glow. Color only ever marks a real risk state (R-09, R-13).
 */
export function RiskBadge({ level, label, className = "" }: RiskBadgeProps) {
  const meta = riskMeta[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] ${meta.badge} ${className}`}
    >
      <span aria-hidden className={`size-1.5 ${meta.bar}`} />
      {label ?? meta.label}
    </span>
  );
}
