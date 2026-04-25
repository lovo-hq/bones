import { createBones } from "bones";
import type { EvolutionChain } from "@/lib/pokeapi";
import styles from "./styles.module.css";

export function EvolutionChainCard({
  chain,
  currentName,
}: {
  chain?: EvolutionChain | Promise<EvolutionChain>;
  currentName?: string;
}) {
  const { bone, data } = createBones(chain);

  return (
    <div className={styles.card}>
      <div className={styles.label}>Evolution Chain</div>
      {data ? (
        <div className={styles.chains}>
          {data.stages.map((branch, bi) => (
            <div key={bi} className={styles.branch}>
              {branch.map((stage, si) => (
                <div key={stage.name} className={styles.stageGroup}>
                  {si > 0 && stage.trigger && (
                    <div className={styles.arrow}>
                      <span>→</span>
                      <span className={styles.trigger}>{stage.trigger}</span>
                    </div>
                  )}
                  <div
                    className={styles.stage}
                    data-current={stage.name === currentName ? "true" : undefined}
                  >
                    <img
                      className={styles.sprite}
                      src={stage.spriteUrl}
                      alt={stage.name}
                      width={52}
                      height={52}
                    />
                    <span className={styles.stageName}>{stage.name}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.skeletonRow}>
          <div className={styles.skeletonCircle} {...bone("block")} />
          <span className={styles.skeletonArrow}>→</span>
          <div className={styles.skeletonCircle} {...bone("block")} />
          <span className={styles.skeletonArrow}>→</span>
          <div className={styles.skeletonCircle} {...bone("block")} />
        </div>
      )}
    </div>
  );
}
