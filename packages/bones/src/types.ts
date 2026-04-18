import type { ReactNode } from "react";

export interface BonesProps {
  children: ReactNode;
  baseColor?: string;
  highlightColor?: string;
  duration?: number;
}
