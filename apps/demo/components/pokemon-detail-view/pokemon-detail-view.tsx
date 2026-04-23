import { createBones } from "bones";
import type { PokemonDetail } from "@/lib/pokeapi";
import { StatBar } from "@/components/stat-bar/stat-bar";
import { TypeBadge } from "@/components/type-badge/type-badge";
import styles from "./styles.module.css";

export function PokemonDetailView({
  pokemon,
}: {
  pokemon?: PokemonDetail | Promise<PokemonDetail>;
}) {
  const { bone, data, repeat } = createBones(pokemon);

  return (
    <div className={styles.detail}>
      <div className={styles.detailHeader}>
        <img
          className={styles.detailImage}
          src={data?.artwork}
          width={200}
          height={200}
          alt={data?.name ?? "Pokemon"}
          {...bone("block")}
        />
        <div className={styles.detailInfo}>
          <h1 className={styles.detailName} {...bone("text")}>
            {data?.name}
          </h1>
          <div className={styles.detailTypes}>
            {repeat(data?.types, 2).map((type, i) => (
              <TypeBadge key={type ?? i} type={type} style={{ width: 56 }} {...bone("text")} />
            ))}
          </div>
          <div className={styles.detailMeta}>
            <span className={styles.metaItem} {...bone("text")}>
              {data && `${data.height / 10} m`}
            </span>
            <span className={styles.metaItem} {...bone("text")}>
              {data && `${data.weight / 10} kg`}
            </span>
          </div>
        </div>
      </div>

      <section className={styles.detailSection}>
        <h2>Description</h2>
        <p className={styles.detailDescription} {...bone("text", { lines: 3 })}>
          {data?.description}
        </p>
      </section>

      <section className={styles.detailSection}>
        <h2>Base Stats</h2>
        <div className={styles.stats}>
          {repeat(data?.stats, 6).map((stat, i) => (
            <StatBar key={stat?.name ?? i} stat={stat} />
          ))}
        </div>
      </section>
    </div>
  );
}
