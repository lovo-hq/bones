"use client";

import { useState, useMemo } from "react";
import type { PokemonMoveEntry, MoveDetail } from "@/lib/pokeapi";
import { TypeBadge } from "@/components/type-badge/type-badge";
import styles from "./styles.module.css";

const LEARN_METHODS = ["level-up", "machine", "egg", "tutor"] as const;
const METHOD_LABELS: Record<string, string> = {
  "level-up": "Level Up",
  machine: "TM / HM",
  egg: "Egg Moves",
  tutor: "Tutor",
};

interface MovesPanelProps {
  moves: PokemonMoveEntry[];
  moveDetails: Record<string, MoveDetail>;
}

export function MovesPanel({ moves, moveDetails }: MovesPanelProps) {
  const versionGroups = useMemo(() => {
    const set = new Set<string>();
    for (const move of moves) {
      for (const vd of move.versionDetails) {
        set.add(vd.versionGroup);
      }
    }
    return [...set].reverse();
  }, [moves]);

  const [activeGame, setActiveGame] = useState(versionGroups[0] ?? "");
  const [activeMethod, setActiveMethod] = useState<string>("level-up");

  const filteredMoves = useMemo(() => {
    const result: {
      name: string;
      level: number;
      detail: MoveDetail | undefined;
    }[] = [];

    for (const move of moves) {
      for (const vd of move.versionDetails) {
        if (vd.versionGroup === activeGame && vd.method === activeMethod) {
          result.push({
            name: move.name,
            level: vd.levelLearnedAt,
            detail: moveDetails[move.name],
          });
        }
      }
    }

    if (activeMethod === "level-up") {
      result.sort((a, b) => a.level - b.level);
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [moves, moveDetails, activeGame, activeMethod]);

  const availableMethods = useMemo(() => {
    const set = new Set<string>();
    for (const move of moves) {
      for (const vd of move.versionDetails) {
        if (vd.versionGroup === activeGame) {
          set.add(vd.method);
        }
      }
    }
    return LEARN_METHODS.filter((m) => set.has(m));
  }, [moves, activeGame]);

  return (
    <div className={styles.panel}>
      <div className={styles.gamePills}>
        {versionGroups.map((vg) => (
          <button
            key={vg}
            className={`${styles.pill} ${vg === activeGame ? styles.pillActive : ""}`}
            onClick={() => {
              setActiveGame(vg);
              setActiveMethod("level-up");
            }}
          >
            {vg.replace(/-/g, " ")}
          </button>
        ))}
      </div>

      <div className={styles.methodTabs}>
        {availableMethods.map((method) => (
          <button
            key={method}
            className={`${styles.methodTab} ${method === activeMethod ? styles.methodTabActive : ""}`}
            onClick={() => setActiveMethod(method)}
          >
            {METHOD_LABELS[method] ?? method}
          </button>
        ))}
      </div>

      {filteredMoves.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thLeft}>
                {activeMethod === "level-up" ? "Lv." : "#"}
              </th>
              <th className={styles.thLeft}>Move</th>
              <th className={styles.thLeft}>Type</th>
              <th className={styles.thLeft}>Cat.</th>
              <th className={styles.thRight}>Pwr</th>
              <th className={styles.thRight}>Acc</th>
              <th className={styles.thRight}>PP</th>
            </tr>
          </thead>
          <tbody>
            {filteredMoves.map((move) => (
              <tr key={move.name}>
                <td className={styles.tdMuted}>{move.level || "—"}</td>
                <td className={styles.tdName}>{move.name.replace(/-/g, " ")}</td>
                <td>
                  {move.detail && (
                    <TypeBadge type={move.detail.type} className={styles.moveType} />
                  )}
                </td>
                <td className={styles.tdMuted}>
                  {move.detail?.damageClass ?? "—"}
                </td>
                <td className={styles.tdRight}>
                  {move.detail?.power ?? "—"}
                </td>
                <td className={styles.tdRight}>
                  {move.detail?.accuracy ?? "—"}
                </td>
                <td className={styles.tdRight}>
                  {move.detail?.pp ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className={styles.empty}>No moves for this method in the selected game.</p>
      )}
    </div>
  );
}
