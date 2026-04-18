import type { ReactNode } from "react";

export function isEmpty(children: ReactNode): boolean {
  if (children == null || children === false || children === "") {
    return true;
  }
  if (typeof children === "string" && children.trim() === "") {
    return true;
  }
  if (Array.isArray(children)) {
    return children.every(isEmpty);
  }
  return false;
}
