"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Loader2, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportItem {
  id: string;
  province_slug: string;
  municipality: string;
  category: string;
  severity: string;
  description: string;
  reporter_name?: string;
  created_at: string;
}

interface CommunityReportsCardProps {
  provinceSlug?: string;
  provinceName?: string;
  className?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  crop_damage: "Crop Stress / Damage",
  water_shortage: "Irrigation / Canal Deficit",
  extreme_heat: "Extreme Heat Incident",
  fire_risk: "Brush / Grassland Fire",
  other: "Field Observation",
};

export function CommunityReportsCard({
  provinceSlug = "metro-manila",
  provinceName = "Metro Manila",
  className = "",
}: CommunityReportsCardProps) {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [municipality, setMunicipality] = useState("");
  const [category, setCategory] = useState("crop_damage");
  const [severity, setSeverity] = useState<"moderate" | "high" | "extreme">("high");
  const [description, setDescription] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/reports?province=${encodeURIComponent(provinceSlug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.reports) {
          setReports(data.reports);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn("Failed to load community reports:", err);
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [provinceSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!municipality.trim() || !description.trim()) return;

    setSubmitting(true);
    setSubmitFeedback(null);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provinceSlug,
          municipality: municipality.trim(),
          category,
          severity,
          description: description.trim(),
          reporterName: reporterName.trim() || "Citizen Observer",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitFeedback(data.message || "Observation recorded!");
        setReports((prev) => [
          {
            id: data.reportId || `temp-${Date.now()}`,
            province_slug: provinceSlug,
            municipality: municipality.trim(),
            category,
            severity,
            description: description.trim(),
            reporter_name: reporterName.trim() || "Citizen Observer",
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        setDescription("");
        setMunicipality("");
        setReporterName("");
        setShowForm(false);
      } else {
        setSubmitFeedback(data.error || "Failed to submit observation.");
      }
    } catch {
      setSubmitFeedback("Network error submitting observation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`border border-border bg-card p-4 sm:p-6 ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-risk-moderate" />
            <p className="font-mono text-[10px] font-semibold tracking-[0.1em] text-risk-moderate uppercase">
              Crowdsourced Field Observations
            </p>
          </div>
          <h3 className="mt-1 font-heading text-lg font-semibold text-foreground">
            {provinceName} Community Ground Reports
          </h3>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setShowForm(!showForm)}
          className="min-h-[44px] w-full border-foreground px-3 py-2 font-mono text-xs font-semibold tracking-[0.06em] uppercase sm:w-auto sm:min-h-[36px]"
        >
          <MessageSquarePlus className="mr-1.5 size-3.5" />
          {showForm ? "Cancel report" : "Submit ground report"}
          {showForm ? (
            <ChevronUp className="ml-1 size-3" />
          ) : (
            <ChevronDown className="ml-1 size-3" />
          )}
        </Button>
      </div>

      {submitFeedback && (
        <div className="mt-4 flex items-center gap-2 border border-risk-low/30 bg-risk-low/10 p-3 text-xs text-foreground">
          <CheckCircle2 className="size-4 text-risk-low" />
          <p className="font-mono">{submitFeedback}</p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-5 border-t border-border pt-4 space-y-4">
          <p className="font-mono text-xs font-semibold text-foreground">
            Log an observation for {provinceName}:
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="report-mun" className="font-mono text-[10px] text-muted-foreground uppercase">
                Municipality / City *
              </label>
              <input
                id="report-mun"
                type="text"
                required
                placeholder="e.g. San Fernando"
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                className="mt-1 min-h-[44px] w-full border border-border bg-background px-3 font-mono text-sm text-foreground focus:border-foreground focus:outline-none sm:min-h-[36px] sm:text-xs"
              />
            </div>

            <div>
              <label htmlFor="report-cat" className="font-mono text-[10px] text-muted-foreground uppercase">
                Category *
              </label>
              <select
                id="report-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 min-h-[44px] w-full border border-border bg-background px-2.5 font-mono text-sm text-foreground focus:border-foreground focus:outline-none sm:min-h-[36px] sm:text-xs"
              >
                <option value="crop_damage">Crop Stress / Yellowing</option>
                <option value="water_shortage">Canal / Irrigation Deficit</option>
                <option value="extreme_heat">Extreme Heat Incident</option>
                <option value="fire_risk">Grassland / Brush Fire</option>
                <option value="other">General Field Note</option>
              </select>
            </div>

            <div>
              <label htmlFor="report-sev" className="font-mono text-[10px] text-muted-foreground uppercase">
                Severity Level
              </label>
              <select
                id="report-sev"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as "moderate" | "high" | "extreme")}
                className="mt-1 min-h-[44px] w-full border border-border bg-background px-2.5 font-mono text-sm text-foreground focus:border-foreground focus:outline-none sm:min-h-[36px] sm:text-xs"
              >
                <option value="moderate">Moderate</option>
                <option value="high">High (Substantial)</option>
                <option value="extreme">Extreme (Critical)</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="report-desc" className="font-mono text-[10px] text-muted-foreground uppercase">
              Description of Ground Conditions *
            </label>
            <textarea
              id="report-desc"
              required
              rows={3}
              placeholder="Describe what is being observed on the ground (e.g. cracked paddy soil, water rotation schedules)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 min-h-[88px] w-full border border-border bg-background p-3 font-mono text-sm text-foreground focus:border-foreground focus:outline-none sm:text-xs"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full sm:max-w-xs">
              <label htmlFor="report-name" className="font-mono text-[10px] text-muted-foreground uppercase">
                Observer Affiliation (Optional)
              </label>
              <input
                id="report-name"
                type="text"
                placeholder="e.g. Rice Farmer / LGU Staff"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="mt-1 min-h-[44px] w-full border border-border bg-background px-3 font-mono text-sm text-foreground focus:border-foreground focus:outline-none sm:min-h-[36px] sm:text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="min-h-[44px] w-full px-5 py-2.5 font-mono text-xs font-semibold tracking-[0.08em] uppercase sm:w-auto"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-3 animate-spin" />
                  Recording...
                </>
              ) : (
                "Submit observation"
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Reports Feed */}
      <div className="mt-5 border-t border-border pt-3">
        {loading ? (
          <p className="font-mono text-xs text-muted-foreground">
            Loading field reports...
          </p>
        ) : reports.length === 0 ? (
          <p className="font-mono text-xs text-muted-foreground">
            No active ground incidents reported for this area yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {reports.slice(0, 4).map((report) => (
              <li key={report.id} className="py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-semibold tracking-[0.08em] text-foreground uppercase">
                      {report.municipality}
                    </span>
                    <span className="border border-border bg-muted px-1.5 py-0.2 font-mono text-[9px] uppercase">
                      {CATEGORY_LABELS[report.category] || report.category}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {new Date(report.created_at).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-foreground">
                  {report.description}
                </p>
                {report.reporter_name && (
                  <p className="mt-1 font-mono text-[9px] text-muted-foreground">
                    Observed by: {report.reporter_name}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
