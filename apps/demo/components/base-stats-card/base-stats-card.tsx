import { createBones } from "bones";
import type { PokemonData } from "@/lib/pokeapi";
import styles from "./styles.module.css";

export function BaseStatsCard({
  pokemon,
}: {
  pokemon?: PokemonData | Promise<PokemonData>;
}) {
  const { bone, data, repeat } = createBones(pokemon);
  const stats = repeat(data?.stats, 6);
  const total = data?.stats.reduce((sum, s) => sum + s.value, 0) ?? 0;

  return (
    <div className={styles.card}>
      <div className={styles.label}>Base Stats</div>
      <div className={styles.stats}>
        {stats.map((stat, i) => {
          const pct = stat ? (stat.value / 255) * 100 : 0;
          return (
            <div key={stat?.name ?? i} className={styles.row}>
              <span className={styles.name} {...bone("text")}>
                {stat?.name}
              </span>
              <div className={styles.track}>
                <div
                  className={styles.fill}
                  style={{ width: stat ? `${pct}%` : "60%" }}
                  {...bone("block")}
                />
              </div>
              <span className={styles.value} {...bone("text")}>
                {stat && String(stat.value)}
              </span>
            </div>
          );
        })}
      </div>
      <div className={styles.total}>
        <span>Total</span>
        <span {...bone("text")}>{data && String(total)}</span>
      </div>
    </div>
  );
}
