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
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/compare")) {
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
  const magnifierRef = useRef<HTMLDivElement | null>(null);
  const magnifierIframeRef = useRef<HTMLIFrameElement | null>(null);

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

  // Sync scroll position to compare iframe by offsetting the iframe itself.
  // We shift the iframe up by the scroll amount and make it tall enough to
  // cover the viewport from that offset. This avoids cross-frame scrollTo
  // issues and works regardless of iframe content height.
  useEffect(() => {
    if (!comparing || !iframeRef.current) return;
    const iframe = iframeRef.current;

    function syncScroll() {
      const y = window.scrollY;
      iframe.style.top = `-${y}px`;
      iframe.style.height = `calc(100vh + ${y}px)`;
    }

    syncScroll();
    window.addEventListener("scroll", syncScroll);
    return () => window.removeEventListener("scroll", syncScroll);
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

  // Sync opacity slider value to both the overlay iframe and magnifier skeleton layer
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.style.opacity = String(compareOpacity);
    }
    if (magnifierIframeRef.current) {
      magnifierIframeRef.current.style.opacity = String(compareOpacity);
    }
  }, [compareOpacity]);

  // Magnifier: zoomed view of the current screen that follows the cursor.
  // Clones the page content once and layers a compare iframe on top at
  // the current opacity, both scaled 2x inside a circular clip.
  useEffect(() => {
    if (!comparing) return;

    const DIAMETER = 200;
    const RADIUS = DIAMETER / 2;
    const ZOOM = 2;

    const compareUrl = new URL(window.location.href);
    compareUrl.pathname = `/compare${compareUrl.pathname}`;

    // Magnifier container (the circular lens)
    const mag = document.createElement("div");
    mag.style.cssText = `
      position:fixed;width:${DIAMETER}px;height:${DIAMETER}px;border-radius:50%;
      overflow:hidden;pointer-events:none;z-index:10000;
      border:3px solid oklch(100% 0 0 / 0.6);
      box-shadow:0 4px 24px oklch(0% 0 0 / 0.4);display:none;
    `;

    // Inner wrapper — holds both layers, scaled 2x
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `position:absolute;top:0;left:0;transform-origin:top left;`;

    // Layer 1: snapshot of the loaded page
    const pageClone = document.createElement("div");
    pageClone.style.cssText = `position:absolute;top:0;left:0;width:100vw;`;
    // Copy body attributes so CSS selectors (data-bone-animate, etc.) match
    for (const attr of document.body.attributes) {
      pageClone.setAttribute(attr.name, attr.value);
    }
    // Clone body children, excluding devtool and overlay iframe
    for (const child of document.body.children) {
      const el = child as HTMLElement;
      if (el === iframeRef.current || el === mag) continue;
      if (el.tagName === "IFRAME") continue;
      if (panelRef.current && el.contains(panelRef.current)) continue;
      if (el.classList?.contains(styles.fab)) continue;
      if (el.classList?.contains(styles.panel)) continue;
      pageClone.appendChild(child.cloneNode(true));
    }
    wrapper.appendChild(pageClone);

    // Layer 2: skeleton overlay (compare iframe at current opacity)
    const skeletonIframe = document.createElement("iframe");
    skeletonIframe.src = compareUrl.toString();
    skeletonIframe.style.cssText = `
      position:absolute;top:0;left:0;width:100vw;height:100vh;
      border:none;pointer-events:none;opacity:${compareOpacity};
    `;
    wrapper.appendChild(skeletonIframe);

    mag.appendChild(wrapper);
    document.body.appendChild(mag);
    magnifierRef.current = mag;
    magnifierIframeRef.current = skeletonIframe;

    function onMouseMove(e: MouseEvent) {
      mag.style.display = "block";
      mag.style.left = `${e.clientX - RADIUS}px`;
      mag.style.top = `${e.clientY - RADIUS}px`;

      // Offset the wrapper so the cursor position maps to the magnifier center
      const scrollY = window.scrollY;
      const x = -(e.clientX * ZOOM - RADIUS);
      const y = -((e.clientY + scrollY) * ZOOM - RADIUS);
      wrapper.style.transform = `scale(${ZOOM}) translate(${x / ZOOM}px, ${y / ZOOM}px)`;
    }

    function onMouseLeave() {
      mag.style.display = "none";
    }

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      mag.remove();
      magnifierRef.current = null;
      magnifierIframeRef.current = null;
    };
  }, [comparing]);

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
    url.pathname = `/compare${url.pathname}`;

    const iframe = document.createElement("iframe");
    iframe.src = url.toString();
    iframe.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100vh;border:none;pointer-events:none;z-index:9998;";
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
      <div className={styles.delaysScroll}>
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
                  {(delays[key] / 1000).toFixed(1)}s
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
