"use client";

import { useCallback, useContext } from "react";
import { BonesContext } from "./context.ts";

export interface BoneOptions {
  lines?: number;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

type BoneProps = Record<string, unknown>;

export function useBone(loading: boolean) {
  const ctx = useContext(BonesContext);
  const isLoading = ctx.forced || loading;

  const bone = useCallback(
    (options?: BoneOptions): BoneProps => {
      if (!isLoading) {
        return {};
      }

      const style: Record<string, string | number> = {};
      const props: BoneProps = {
        className: "bone-placeholder",
        "aria-busy": true,
      };

      if (options?.width) style.width = options.width;
      if (options?.height) style.height = options.height;
      if (options?.circle) style.borderRadius = "50%";
      if (options?.lines && options.lines > 1) {
        style["--bone-lines"] = options.lines;
      }

      if (Object.keys(style).length > 0) {
        props.style = style;
      }

      return props;
    },
    [isLoading],
  );

  return bone;
}
