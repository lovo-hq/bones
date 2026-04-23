import type { ReactNode } from "react";
import { SectionHeader } from "@/components/section-header/section-header";
import styles from "./styles.module.css";

export function DemoSection({
  title,
  description,
  hint,
  children,
}: {
  title: string;
  description: ReactNode;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.demoSection}>
      <SectionHeader title={title} description={description} hint={hint} />
      {children}
    </section>
  );
}
