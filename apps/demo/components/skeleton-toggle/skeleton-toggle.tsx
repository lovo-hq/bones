"use client";

import { useState, type ReactNode } from "react";
import styles from "./styles.module.css";

export function SkeletonToggle({
  children,
  skeleton,
}: {
  children: ReactNode;
  skeleton: ReactNode;
}) {
  const [forced, setForced] = useState(false);

  return (
    <div>
      <button className={styles.toggleButton} onClick={() => setForced((prev) => !prev)}>
        {forced ? "Show Content" : "Force Skeletons"}
      </button>
      {forced ? skeleton : children}
    </div>
  );
}
