"use client";

import { useContext, type ElementType } from "react";
import { BonesContext } from "./context.ts";
import { isEmpty } from "./is-empty.ts";
import type { BoneOwnProps, PolymorphicProps } from "./types.ts";

export function Bone<C extends ElementType = "span">({
  as,
  children,
  lines,
  circle,
  width,
  height,
  className,
  ...rest
}: PolymorphicProps<C, BoneOwnProps>) {
  const Component = as || "span";
  const ctx = useContext(BonesContext);
  const loading = ctx.forced || isEmpty(children);

  if (!loading) {
    return (
      <Component className={className} {...rest}>
        {children}
      </Component>
    );
  }

  const lineCount = lines ?? 1;
  const placeholders = Array.from({ length: lineCount }, (_, i) => (
    <span
      key={i}
      className="bone-placeholder"
      style={{
        width: i === lineCount - 1 && lineCount > 1 ? "80%" : (width ?? "100%"),
        height: height ?? undefined,
        borderRadius: circle ? "50%" : undefined,
      }}
      aria-hidden="true"
    />
  ));

  return (
    <Component className={className} aria-busy="true" {...rest}>
      {placeholders}
    </Component>
  );
}
