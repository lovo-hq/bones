"use client";

import { useState, type ReactNode } from "react";
import { Bones } from "bones";

/**
 * Demonstrates the <Bones> provider — forces all nested
 * useBone hooks into skeleton mode, even when data is loaded.
 */
export function SkeletonToggle({ children }: { children: ReactNode }) {
  const [forced, setForced] = useState(false);

  const content = forced ? <Bones>{children}</Bones> : children;

  return (
    <div>
      <button className="toggle-button" onClick={() => setForced((prev) => !prev)}>
        {forced ? "Show Content" : "Force Skeletons"}
      </button>
      {content}
    </div>
  );
}
