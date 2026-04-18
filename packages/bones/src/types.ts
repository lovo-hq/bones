import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

export interface BoneOwnProps {
  lines?: number;
  circle?: boolean;
  width?: string | number;
  height?: string | number;
  children?: ReactNode;
}

type AsProp<C extends ElementType> = { as?: C };

type PropsToOmit<C extends ElementType, P> = keyof (AsProp<C> & P);

export type PolymorphicProps<C extends ElementType, Props = object> = Props &
  AsProp<C> &
  Omit<ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

export interface BoneImageProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "width" | "height"
> {
  width: number;
  height: number;
  circle?: boolean;
}

export interface BonesProps {
  children: ReactNode;
  baseColor?: string;
  highlightColor?: string;
  duration?: number;
}
