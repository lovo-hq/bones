"use client";

import { useCallback, useContext } from "react";
import { BonesContext } from "./context.ts";

export type BoneType = "text" | "block";

export interface BoneOptions {
  lines?: number;
}

type BoneProps = Record<string, unknown>;

export function useBone(loading: boolean) {
  const ctx = useContext(BonesContext);
  const isLoading = ctx.forced || loading;

  const bone = useCallback(
    (type: BoneType, options?: BoneOptions): BoneProps => {
      if (!isLoading) {
        return {};
      }

      const className = type === "text" ? "bone-text" : "bone-block";
      const props: BoneProps = {
        className,
        "aria-busy": true,
      };

      if (type === "text" && options?.lines && options.lines > 1) {
        props.style = { "--bone-lines": options.lines };
      }

      return props;
    },
    [isLoading],
  );

  return bone;
}
