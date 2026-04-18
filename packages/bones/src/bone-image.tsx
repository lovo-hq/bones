"use client";

import { useContext } from "react";
import { BonesContext } from "./context.ts";
import type { BoneImageProps } from "./types.ts";

export function BoneImage({ src, width, height, circle, className, alt, ...rest }: BoneImageProps) {
  const ctx = useContext(BonesContext);
  const loading = ctx.forced || !src;

  if (!loading) {
    return (
      <img src={src} width={width} height={height} className={className} alt={alt} {...rest} />
    );
  }

  return (
    <span
      className={`${className ?? ""} bone-placeholder`.trim()}
      style={{
        display: "inline-block",
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        borderRadius: circle ? "50%" : undefined,
      }}
      role="img"
      aria-label={alt ?? "Loading image..."}
      aria-busy="true"
    />
  );
}
