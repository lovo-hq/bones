"use client";

import { BonesContext } from "./context.ts";
import type { BonesProps } from "./types.ts";

export function Bones({ children, baseColor, highlightColor, duration }: BonesProps) {
  const style: Record<string, string> = {};
  if (baseColor) style["--bone-base"] = baseColor;
  if (highlightColor) style["--bone-highlight"] = highlightColor;
  if (duration) style["--bone-duration"] = `${String(duration)}s`;

  const hasCustomStyles = Object.keys(style).length > 0;

  return (
    <BonesContext.Provider value={{ forced: true }}>
      {hasCustomStyles ? <div style={style}>{children}</div> : children}
    </BonesContext.Provider>
  );
}
