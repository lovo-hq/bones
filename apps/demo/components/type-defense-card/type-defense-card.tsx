import { createBones } from "bones";
import type { TypeDefenseMap } from "@/lib/pokeapi";
import { TypeBadge } from "@/components/type-badge/type-badge";
import styles from "./styles.module.css";

function formatMultiplier(m: number): string {
  if (m === 0.25) return "¼x";
  if (m === 0.5) return "½x";
  return `${m}x`;
}

export function TypeDefenseCard({
  typeDefense,
}: {
  typeDefense?: TypeDefenseMap | Promise<TypeDefenseMap>;
}) {
  const { bone, data } = createBones(typeDefense);

  return (
    <div className={styles.card}>
      <div className={styles.label}>Type Defense</div>

      {data ? (
        <>
          {data.weakTo.length > 0 && (
            <div className={styles.group}>
              <div className={styles.groupLabel}>Weak to</div>
              <div className={styles.pills}>
                {data.weakTo.map((w) => (
                  <TypeBadge key={w.type} type={w.type} className={styles.pill}>
                    {w.type} {formatMultiplier(w.multiplier)}
                  </TypeBadge>
                ))}
              </div>
            </div>
          )}

          {data.resistantTo.length > 0 && (
            <div className={styles.group}>
              <div className={styles.groupLabel}>Resistant to</div>
              <div className={styles.pills}>
                {data.resistantTo.map((r) => (
                  <TypeBadge key={r.type} type={r.type} className={styles.pill}>
                    {r.type} {formatMultiplier(r.multiplier)}
                  </TypeBadge>
                ))}
              </div>
            </div>
          )}

          {data.immuneTo.length > 0 && (
            <div className={styles.group}>
              <div className={styles.groupLabel}>Immune to</div>
              <div className={styles.pills}>
                {data.immuneTo.map((t) => (
                  <TypeBadge key={t} type={t} className={styles.pill}>
                    {t} 0x
                  </TypeBadge>
                ))}
              </div>
            </div>
          )}

          {data.neutral.length > 0 && (
            <div className={styles.group}>
              <div className={styles.groupLabel}>Neutral</div>
              <div className={styles.pills}>
                {data.neutral.map((t) => (
                  <TypeBadge key={t} type={t} className={styles.pill} />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className={styles.skeleton}>
          <div {...bone("text", { lines: 3 })} />
        </div>
      )}
    </div>
  );
}
