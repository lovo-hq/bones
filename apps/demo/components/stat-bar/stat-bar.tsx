import { createBones } from "bones";
import styles from "./styles.module.css";

export function StatBar({ stat }: { stat?: { name: string; value: number } }) {
  const { bone } = createBones(stat);
  const pct = stat ? (stat.value / 255) * 100 : 0;

  return (
    <div className={styles.statRow}>
      <span className={styles.statName} {...bone("text")}>
        {stat?.name}
      </span>
      <span className={styles.statValue} {...bone("text")}>
        {stat ? String(stat.value) : undefined}
      </span>
      <div className={styles.statBarTrack}>
        <div
          className={styles.statBarFill}
          style={{ width: stat ? `${pct}%` : "60%" }}
          {...bone("block")}
        />
      </div>
    </div>
  );
}
