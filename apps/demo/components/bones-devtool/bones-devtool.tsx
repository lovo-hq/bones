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
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [open, setOpen] = useState(false);
  const [force, setForce] = useState(false);
  const [animate, setAnimate] = useState<string>("shimmer");
  const [delays, setDelays] = useState<Record<DelayKey, number>>(
    () =>
      Object.fromEntries(Object.entries(DEMO_DELAYS).map(([k, v]) => [k, v.default])) as Record<
        DelayKey,
        number
      >,
  );

  // Sync state from cookies on mount
  useEffect(() => {
    setForce(getCookie("bones-force") === "1");
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

  function toggleForce() {
    const next = !force;
    setForce(next);
    if (next) {
      setCookie("bones-force", "1");
    } else {
      removeCookie("bones-force");
    }
    router.refresh();
  }

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
          <Settings2 size={16} className={styles.titleIcon} />
          <span className={styles.titleText}>BONES</span>
          <span className={styles.titleBadge}>DevTool</span>
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

      {/* Force Skeletons */}
      <div className={styles.toggleRow}>
        <div>
          <div className={styles.toggleLabel}>Force Skeletons</div>
          <div className={styles.toggleHint}>Override all components</div>
        </div>
        <button
          type="button"
          className={styles.toggle}
          data-on={force}
          onClick={toggleForce}
          aria-label="Toggle force skeletons"
        >
          <span className={styles.toggleKnob} />
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

      <div className={styles.footer}>Changes trigger a soft refresh</div>
    </div>
  );
}
