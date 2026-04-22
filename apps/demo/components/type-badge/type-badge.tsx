import type { ComponentProps } from "react";
import styles from "./styles.module.css";

export function TypeBadge({
  type,
  className,
  ...props
}: { type?: string } & ComponentProps<"span">) {
  return (
    <span
      className={`${styles.badge}${type ? ` ${styles[type]}` : ""}${className ? ` ${className}` : ""}`}
      {...props}
    >
      {type}
    </span>
  );
}
