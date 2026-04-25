import type { ComponentProps } from "react";
import styles from "./styles.module.css";

export function TypeBadge({
  type,
  className,
  children,
  ...props
}: { type?: string } & ComponentProps<"span">) {
  return (
    <span
      className={`${styles.badge}${type ? ` ${styles[type]}` : ""}${className ? ` ${className}` : ""}`}
      {...props}
    >
      {children ?? type}
    </span>
  );
}
