"use client";

import { useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AlertSubscriptionCardProps {
  provinceSlug?: string;
  provinceName?: string;
  className?: string;
}

export function AlertSubscriptionCard({
  provinceSlug = "metro-manila",
  provinceName = "Metro Manila",
  className = "",
}: AlertSubscriptionCardProps) {
  const [channel, setChannel] = useState<"sms" | "email">("sms");
  const [contact, setContact] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          contact: contact.trim(),
          provinceSlug,
          municipality: municipality.trim() || undefined,
          notifyHeatDanger: true,
          notifyDroughtAlerts: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);
        setStatusMessage(data.message || "Subscribed successfully!");
      } else {
        setStatusMessage(data.error || "Failed to subscribe. Please try again.");
      }
    } catch {
      setStatusMessage("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`border border-border bg-card p-6 ${className}`}>
      <div className="flex items-center gap-2">
        <Bell className="size-4 text-accent" />
        <p className="font-mono text-[10px] font-semibold tracking-[0.1em] text-accent uppercase">
          Early Warning Registry
        </p>
      </div>

      <h3 className="mt-1 font-heading text-lg font-semibold text-foreground">
        Get Severe Heat & Drought Alerts
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Receive instant alerts when the DOST-PAGASA Heat Index in {provinceName} reaches Danger levels (≥ 42°C) or new drought advisories are issued.
      </p>

      {isSuccess ? (
        <div className="mt-4 border border-emerald-800/30 bg-emerald-50/50 p-4 text-emerald-900">
          <div className="flex items-center gap-2">
            <Check className="size-4 text-emerald-700" />
            <p className="font-mono text-xs font-semibold">{statusMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsSuccess(false);
              setContact("");
              setStatusMessage(null);
            }}
            className="mt-3 font-mono text-[11px] text-emerald-700 underline underline-offset-4"
          >
            Register another contact
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2 font-mono text-xs">
              <input
                type="radio"
                name="channel"
                value="sms"
                checked={channel === "sms"}
                onChange={() => setChannel("sms")}
                className="accent-foreground"
              />
              SMS Mobile (PH)
            </label>
            <label className="flex cursor-pointer items-center gap-2 font-mono text-xs">
              <input
                type="radio"
                name="channel"
                value="email"
                checked={channel === "email"}
                onChange={() => setChannel("email")}
                className="accent-foreground"
              />
              Email
            </label>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-input" className="sr-only">
                {channel === "sms" ? "Mobile Number" : "Email Address"}
              </label>
              <input
                id="contact-input"
                type={channel === "sms" ? "tel" : "email"}
                placeholder={channel === "sms" ? "0917 123 4567" : "name@example.com"}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
                className="h-9 w-full border border-border bg-background px-3 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="municipality-input" className="sr-only">
                Municipality or City
              </label>
              <input
                id="municipality-input"
                type="text"
                placeholder="Municipality (Optional)"
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                className="h-9 w-full border border-border bg-background px-3 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="h-9 px-4 font-mono text-xs font-semibold tracking-[0.08em] uppercase"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-3 animate-spin" />
                  Registering...
                </>
              ) : (
                "Subscribe to alerts"
              )}
            </Button>
            <span className="font-mono text-[10px] text-muted-foreground">
              Free public service · Zero spam
            </span>
          </div>

          {statusMessage && !isSuccess && (
            <p className="font-mono text-xs text-risk-high">{statusMessage}</p>
          )}
        </form>
      )}
    </div>
  );
}
