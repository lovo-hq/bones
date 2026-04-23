import type { ReactNode } from "react";
import styles from "./styles.module.css";

export function SectionHeader({
  title,
  description,
  hint,
}: {
  title: string;
  description: ReactNode;
  hint?: string;
}) {
  return (
    <div className={styles.sectionHeader}>
      <h2>{title}</h2>
      <p className={styles.sectionDesc}>{description}</p>
      {hint && <p className={styles.sectionHint}>{hint}</p>}
    </div>
  );
}
