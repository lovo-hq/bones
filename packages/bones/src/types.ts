import type { ReactNode } from "react";

export type Streamable<T> = T | Promise<T>;

interface BonesThemeProps {
  baseColor?: string;
  highlightColor?: string;
  duration?: number;
}

export interface BonesStreamingProps<T> extends BonesThemeProps {
  value: Streamable<T>;
  children: (data: T | undefined) => ReactNode;
  forced?: never;
}

export interface BonesArrayProps<T extends readonly Streamable<unknown>[]> extends BonesThemeProps {
  value: T;
  children: (data: { -readonly [P in keyof T]: Awaited<T[P]> } | undefined) => ReactNode;
  forced?: never;
}

export interface BonesForcedProps extends BonesThemeProps {
  forced: true;
  children: ReactNode;
  value?: never;
}

export type BonesProps<T = unknown> =
  | BonesStreamingProps<T>
  | BonesArrayProps<T extends readonly Streamable<unknown>[] ? T : never>
  | BonesForcedProps;
