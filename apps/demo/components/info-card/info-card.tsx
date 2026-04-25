import { createBones } from "bones";
import styles from "./styles.module.css";

interface InfoRow {
  label: string;
  value: string;
}

export function InfoCard({
  title,
  rows,
}: {
  title: string;
  rows?: InfoRow[] | Promise<InfoRow[]>;
}) {
  const { bone, data, repeat } = createBones(rows);

  return (
    <div className={styles.card}>
      <div className={styles.label}>{title}</div>
      <div className={styles.rows}>
        {repeat(data, 4).map((row, i) => (
          <div key={row?.label ?? i} className={styles.row}>
            <span className={styles.rowLabel} {...bone("text")}>
              {row?.label}
            </span>
            <span className={styles.rowValue} {...bone("text")}>
              {row?.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
