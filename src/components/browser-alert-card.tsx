"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, BellOff, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RiskLevel } from "@/lib/types";

interface BrowserAlertCardProps {
  provinceSlug?: string;
  provinceName?: string;
  riskLevel?: RiskLevel;
  className?: string;
}

type NotificationStatus = "unsupported" | "default" | "granted" | "denied";

export function BrowserAlertCard({
  provinceSlug = "metro-manila",
  provinceName = "Metro Manila",
  riskLevel = "low",
  className = "",
}: BrowserAlertCardProps) {
  const [permission, setPermission] = useState<NotificationStatus>(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    return Notification.permission as NotificationStatus;
  });
  const [isEnabled, setIsEnabled] = useState(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return false;
    const saved = localStorage.getItem("bantay_browser_alerts_enabled");
    return saved === "true" && Notification.permission === "granted";
  });
  const [feedback, setFeedback] = useState<string | null>(null);

  const sendBrowserNotification = useCallback(
    (title: string, body: string, tagSuffix = "general") => {
      if (typeof window === "undefined" || !("Notification" in window)) return;
      if (Notification.permission !== "granted") return;

      try {
        const notif = new Notification(title, {
          body,
          icon: "/favicon.ico",
          tag: `bantay-alert-${provinceSlug}-${tagSuffix}`,
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (err) {
        console.warn("Could not dispatch browser notification:", err);
      }
    },
    [provinceSlug]
  );

  // Auto-alert if province is in High or Extreme risk and alerts are enabled
  useEffect(() => {
    if (!isEnabled || permission !== "granted") return;
    if (riskLevel !== "high" && riskLevel !== "extreme") return;

    const sessionKey = `bantay_notified_${provinceSlug}_${riskLevel}`;
    const alreadyNotified = sessionStorage.getItem(sessionKey);

    if (!alreadyNotified) {
      sendBrowserNotification(
        `Bantay El Niño: ${provinceName} Warning`,
        `High heat and drought risk active for ${provinceName}. Follow local water conservation and heat safety protocols.`,
        "auto-risk"
      );
      sessionStorage.setItem(sessionKey, Date.now().toString());
    }
  }, [provinceSlug, provinceName, riskLevel, isEnabled, permission, sendBrowserNotification]);

  const handleEnableAlerts = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }

    setFeedback(null);

    try {
      const res = await Notification.requestPermission();
      setPermission(res as NotificationStatus);

      if (res === "granted") {
        setIsEnabled(true);
        localStorage.setItem("bantay_browser_alerts_enabled", "true");
        setFeedback("In-browser alerts activated for this device.");

        sendBrowserNotification(
          "Bantay El Niño: Alerts Activated",
          `You will receive immediate notifications when ${provinceName} enters Danger heat index (≥ 42°C) or severe drought status.`,
          "test"
        );
      } else if (res === "denied") {
        setIsEnabled(false);
        localStorage.setItem("bantay_browser_alerts_enabled", "false");
        setFeedback("Notifications blocked in browser settings.");
      }
    } catch {
      setFeedback("Unable to request notification permission.");
    }
  };

  const handleDisableAlerts = () => {
    setIsEnabled(false);
    localStorage.setItem("bantay_browser_alerts_enabled", "false");
    setFeedback("Browser alerts turned off.");
  };

  const handleSendTest = () => {
    sendBrowserNotification(
      `Bantay El Niño: Test Alert (${provinceName})`,
      `Browser alert system functional. Current risk status for ${provinceName}: ${riskLevel.toUpperCase()}.`,
      "manual-test"
    );
    setFeedback("Test notification dispatched.");
  };

  return (
    <div className={`border border-border bg-card p-4 sm:p-6 ${className}`}>
      <div className="flex items-center gap-2">
        <Bell className="size-4 text-accent" />
        <p className="font-mono text-[10px] font-semibold tracking-[0.1em] text-accent uppercase">
          In-Browser Warning System
        </p>
      </div>

      <h3 className="mt-1 font-heading text-lg font-semibold text-foreground">
        Direct Severe Heat & Drought Alerts
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Get immediate system notifications on this device when the heat index in {provinceName} hits
        Danger levels (≥ 42°C) or severe drought advisories are active. Zero registration required.
      </p>

      {permission === "unsupported" ? (
        <div className="mt-4 border border-border bg-muted p-4">
          <p className="font-mono text-xs text-muted-foreground">
            Web Notifications are not supported in this browser. Live indicators and official PAGASA
            bulletins on this page remain continuously available.
          </p>
        </div>
      ) : permission === "denied" ? (
        <div className="mt-4 border border-risk-high/30 bg-risk-high/5 p-4">
          <div className="flex items-center gap-2 text-risk-high">
            <AlertTriangle className="size-4" />
            <p className="font-mono text-xs font-semibold">Notifications Blocked</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Browser notifications are blocked for this site. To receive instant warnings, permit
            notifications in your browser address bar permissions.
          </p>
        </div>
      ) : isEnabled && permission === "granted" ? (
        <div className="mt-4 space-y-3">
          <div className="border border-risk-low/30 bg-risk-low/10 p-4 text-foreground">
            <div className="flex items-center gap-2">
              <Check className="size-4 text-risk-low" />
              <p className="font-mono text-xs font-semibold text-foreground">
                Alerts active for {provinceName}
              </p>
            </div>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              Monitored on this browser. Triggers when local heat index reaches ≥ 42°C.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleSendTest}
              className="min-h-[44px] w-full border-foreground px-3 py-2.5 font-mono text-xs font-semibold tracking-[0.06em] uppercase sm:w-auto"
            >
              Send test alert
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleDisableAlerts}
              className="min-h-[44px] w-full border-border px-3 py-2.5 font-mono text-xs text-muted-foreground uppercase hover:text-foreground sm:w-auto"
            >
              <BellOff className="mr-1.5 size-3.5" />
              Turn off
            </Button>
          </div>

          {feedback && (
            <p className="font-mono text-xs text-muted-foreground">{feedback}</p>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              onClick={handleEnableAlerts}
              className="min-h-[44px] w-full px-4 py-2.5 font-mono text-xs font-semibold tracking-[0.08em] uppercase sm:w-auto"
            >
              <Bell className="mr-2 size-3.5" />
              Enable browser alerts
            </Button>
            <span className="font-mono text-[10px] text-muted-foreground">
              Local to device · Zero accounts · No personal data stored
            </span>
          </div>

          {feedback && (
            <p className="font-mono text-xs text-risk-high">{feedback}</p>
          )}
        </div>
      )}
    </div>
  );
}
