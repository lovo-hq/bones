"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Settings2, X } from "lucide-react";
import { DEMO_DELAYS, type DelayKey } from "@/lib/demo-delays";
import styles from "./styles.module.css";

function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
}

function removeCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

const ANIMATION_OPTIONS = ["shimmer", "pulse", "none"] as const;

export function BonesDevTool() {
  // Don't render inside the compare iframe
  if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("bones-compare") === "1") {
    return null;
  }

  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [open, setOpen] = useState(false);
  const [animate, setAnimate] = useState<string>("shimmer");
  const [delays, setDelays] = useState<Record<DelayKey, number>>(
    () =>
      Object.fromEntries(Object.entries(DEMO_DELAYS).map(([k, v]) => [k, v.default])) as Record<
        DelayKey,
        number
      >,
  );
  const [comparing, setComparing] = useState(false);
  const [compareOpacity, setCompareOpacity] = useState(0.5);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Sync state from cookies on mount
  useEffect(() => {
    setAnimate(getCookie("bones-animate") ?? "shimmer");
    const raw = getCookie("bones-delays");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setDelays((prev) => ({ ...prev, ...parsed }));
      } catch {
        // ignore malformed cookie
      }
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Sync scroll position to compare iframe
  useEffect(() => {
    if (!comparing || !iframeRef.current) return;
    const iframe = iframeRef.current;
    let ready = false;
    let cancelled = false;

    function syncScroll() {
      if (iframe.contentWindow) {
        iframe.contentWindow.scrollTo(window.scrollX, window.scrollY);
      }
    }

    iframe.addEventListener("load", () => {
      ready = true;
      // Retry scroll sync several times to account for hydration/layout shifts
      const delays = [0, 100, 300, 600, 1000];
      for (const ms of delays) {
        setTimeout(() => {
          if (!cancelled) syncScroll();
        }, ms);
      }
    });

    function onScroll() {
      if (ready) syncScroll();
    }

    window.addEventListener("scroll", onScroll);
    return () => {
      cancelled = true;
      window.removeEventListener("scroll", onScroll);
    };
  }, [comparing]);

  // Escape key closes compare mode
  useEffect(() => {
    if (!comparing) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        stopCompare();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [comparing]);

  // Tear down compare on navigation
  useEffect(() => {
    if (!comparing) return;
    function onPopState() {
      stopCompare();
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [comparing]);

  // Sync opacity slider value to iframe
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.style.opacity = String(compareOpacity);
    }
  }, [compareOpacity]);

  // Handle iframe load failure
  useEffect(() => {
    if (!comparing || !iframeRef.current) return;
    const iframe = iframeRef.current;
    function onError() {
      console.warn("[BonesDevTool] Compare iframe failed to load");
      stopCompare();
    }
    iframe.addEventListener("error", onError);
    return () => iframe.removeEventListener("error", onError);
  }, [comparing]);

  function changeAnimate(value: string) {
    setAnimate(value);
    setCookie("bones-animate", value);
    router.refresh();
  }

  function changeDelay(key: DelayKey, value: number) {
    const next = { ...delays, [key]: value };
    setDelays(next);
    setCookie("bones-delays", JSON.stringify(next));
    clearTimeout(refreshTimeoutRef.current);
    refreshTimeoutRef.current = setTimeout(() => router.refresh(), 300);
  }

  function resetDelays() {
    const defaults = Object.fromEntries(
      Object.entries(DEMO_DELAYS).map(([k, v]) => [k, v.default]),
    ) as Record<DelayKey, number>;
    setDelays(defaults);
    removeCookie("bones-delays");
    router.refresh();
  }

  function startCompare() {
    const url = new URL(window.location.href);
    url.searchParams.set("bones-compare", "1");

    const iframe = document.createElement("iframe");
    iframe.src = url.toString();
    iframe.style.cssText =
      "position:fixed;inset:0;width:100%;height:100%;border:none;pointer-events:none;z-index:9998;";
    iframe.style.opacity = String(compareOpacity);
    document.body.appendChild(iframe);
    iframeRef.current = iframe;
    setComparing(true);
  }

  function stopCompare() {
    if (iframeRef.current) {
      iframeRef.current.remove();
      iframeRef.current = null;
    }
    setComparing(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        className={styles.fab}
        onClick={() => setOpen(true)}
        aria-label="Open Bones DevTool"
      >
        <Settings2 size={20} />
      </button>
    );
  }

  return (
    <div ref={panelRef} className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.titleText}>Bones DevTool</span>
        </div>
        <button
          type="button"
          className={styles.closeButton}
          onClick={() => setOpen(false)}
          aria-label="Close DevTool"
        >
          <X size={14} />
        </button>
      </div>

      {/* Animation Style */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Animation</div>
        <div className={styles.segmented}>
          {ANIMATION_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              className={styles.segmentButton}
              data-active={animate === opt}
              onClick={() => changeAnimate(opt)}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.divider} />

      {/* Delays */}
      <div>
        <div className={styles.delaysHeader}>
          <div className={styles.sectionLabel} style={{ marginBottom: 0 }}>
            Delays
          </div>
          <button type="button" className={styles.resetButton} onClick={resetDelays}>
            Reset All
          </button>
        </div>
        {(Object.entries(DEMO_DELAYS) as [DelayKey, (typeof DEMO_DELAYS)[DelayKey]][]).map(
          ([key, config]) => (
            <div key={key} className={styles.delayRow}>
              <div className={styles.delayMeta}>
                <span className={styles.delayName}>{config.label}</span>
                <span className={styles.delayValue} data-zero={delays[key] === 0}>
                  {delays[key]}ms
                </span>
              </div>
              <input
                type="range"
                className={styles.slider}
                min={0}
                max={3000}
                step={100}
                value={delays[key]}
                onChange={(e) => changeDelay(key, Number(e.target.value))}
              />
            </div>
          ),
        )}
      </div>

      <div className={styles.divider} />

      {/* Compare Bones */}
      {comparing ? (
        <div className={styles.compareSection}>
          <div className={styles.compareHeader}>
            <span className={styles.compareLabel}>Comparing</span>
            <span className={styles.compareBadge}>esc to close</span>
          </div>
          <div className={styles.compareSlider}>
            <span className={styles.compareEndLabel}>Loaded</span>
            <input
              type="range"
              className={styles.slider}
              min={0}
              max={1}
              step={0.01}
              value={compareOpacity}
              onChange={(e) => setCompareOpacity(Number(e.target.value))}
            />
            <span className={styles.compareEndLabel}>Bones</span>
          </div>
          <button type="button" className={styles.stopButton} onClick={stopCompare}>
            Stop Comparing
          </button>
        </div>
      ) : (
        <button type="button" className={styles.compareButton} onClick={startCompare}>
          Compare Bones
        </button>
      )}

      <div className={styles.footer}>Changes trigger a soft refresh</div>
    </div>
  );
}
