import styles from "./styles.module.css";

const VERSION_TO_GENERATION: Record<string, string> = {
  red: "I", blue: "I", yellow: "I",
  gold: "II", silver: "II", crystal: "II",
  ruby: "III", sapphire: "III", emerald: "III", firered: "III", leafgreen: "III",
  diamond: "IV", pearl: "IV", platinum: "IV", heartgold: "IV", soulsilver: "IV",
  black: "V", white: "V", "black-2": "V", "white-2": "V",
  x: "VI", y: "VI", "omega-ruby": "VI", "alpha-sapphire": "VI",
  sun: "VII", moon: "VII", "ultra-sun": "VII", "ultra-moon": "VII",
  "lets-go-pikachu": "VII", "lets-go-eevee": "VII",
  sword: "VIII", shield: "VIII", "legends-arceus": "VIII",
  "brilliant-diamond": "VIII", "shining-pearl": "VIII",
  scarlet: "IX", violet: "IX",
};

interface FlavorEntry {
  text: string;
  version: string;
}

function romanToNum(r: string): number {
  const map: Record<string, number> = {
    I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, "?": 99,
  };
  return map[r] ?? 99;
}

export function DexEntriesPanel({ entries }: { entries: FlavorEntry[] }) {
  const grouped: Record<string, FlavorEntry[]> = {};

  for (const entry of entries) {
    const gen = VERSION_TO_GENERATION[entry.version] ?? "?";
    if (!grouped[gen]) grouped[gen] = [];
    if (!grouped[gen].some((e) => e.text === entry.text && e.version === entry.version)) {
      grouped[gen].push(entry);
    }
  }

  const generations = Object.entries(grouped).sort(
    ([a], [b]) => romanToNum(a) - romanToNum(b),
  );

  return (
    <div className={styles.panel}>
      {generations.map(([gen, genEntries]) => (
        <div key={gen} className={styles.genGroup}>
          <div className={styles.genHeader}>Generation {gen}</div>
          {genEntries.map((entry) => (
            <div key={entry.version} className={styles.entry}>
              <span className={styles.versionLabel}>{entry.version.replace(/-/g, " ")}</span>
              <span className={styles.flavorText}>{entry.text}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
