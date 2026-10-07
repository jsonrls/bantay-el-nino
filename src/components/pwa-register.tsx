"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .catch((err) => {
            console.warn("ServiceWorker registration notice:", err);
          });
      });
    }

    // 2. Intercept install prompt for mobile / desktop PWA installation
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const dismissed = sessionStorage.getItem("bantay_pwa_banner_dismissed");
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    setShowInstallBanner(false);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem("bantay_pwa_banner_dismissed", "true");
  };

  if (!showInstallBanner || !deferredPrompt) {
    return null;
  }

  return (
    <aside
      aria-label="Install App"
      className="fixed bottom-16 left-4 right-4 z-40 mx-auto max-w-lg border border-border bg-card p-3 md:bottom-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center border border-border bg-muted">
            <Download className="size-3.5 text-accent" />
          </span>
          <div>
            <p className="font-heading text-xs font-semibold text-foreground">
              Install Bantay El Niño
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              Add to home screen for offline access & instant heat alerts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleInstallClick}
            className="min-h-[36px] border border-foreground bg-foreground px-3 py-1 font-mono text-[10px] font-semibold tracking-[0.06em] text-background uppercase hover:bg-foreground/90"
          >
            Install
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
            className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
