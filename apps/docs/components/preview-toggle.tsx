"use client";

import { useState, type ReactNode } from "react";
import { BonesForce } from "bones";

export function PreviewToggle({ children }: { children: ReactNode }) {
  const [skeleton, setSkeleton] = useState(true);

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 12,
        }}
      >
        <button
          onClick={() => setSkeleton(false)}
          style={{
            fontSize: 12,
            padding: "2px 10px",
            borderRadius: 6,
            border: "1px solid transparent",
            cursor: "pointer",
            background: !skeleton
              ? "var(--fd-color-accent)"
              : "var(--fd-color-fd-muted)",
            color: !skeleton
              ? "var(--fd-color-accent-foreground)"
              : "var(--fd-color-fd-muted-foreground)",
          }}
        >
          Loaded
        </button>
        <button
          onClick={() => setSkeleton(true)}
          style={{
            fontSize: 12,
            padding: "2px 10px",
            borderRadius: 6,
            border: "1px solid transparent",
            cursor: "pointer",
            background: skeleton
              ? "var(--fd-color-accent)"
              : "var(--fd-color-fd-muted)",
            color: skeleton
              ? "var(--fd-color-accent-foreground)"
              : "var(--fd-color-fd-muted-foreground)",
          }}
        >
          Skeleton
        </button>
      </div>
      <div data-bone-animate="shimmer">
        {skeleton ? <BonesForce>{children}</BonesForce> : children}
      </div>
    </div>
  );
}
