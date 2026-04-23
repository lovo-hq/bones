import { DemoSection } from "@/components/demo-section/demo-section";
import { PokemonCard } from "@/components/pokemon-card/pokemon-card";
import styles from "./styles.module.css";

export function ThemingDemo() {
  return (
    <DemoSection
      title="Theming"
      description={
        <>
          Customize skeleton colors with CSS custom properties. Zero-runtime — just override{" "}
          <code>--bone-base</code> and <code>--bone-highlight</code>.
        </>
      }
    >
      <div className={styles.themeDemos}>
        <div
          className={styles.themeDemo}
          style={
            { "--bone-base": "#f5e6d3", "--bone-highlight": "#faf0e6" } as React.CSSProperties
          }
        >
          <p className={styles.themeLabel}>Warm</p>
          <PokemonCard />
        </div>
        <div
          className={styles.themeDemo}
          style={
            { "--bone-base": "#d3e5f5", "--bone-highlight": "#e6f0fa" } as React.CSSProperties
          }
        >
          <p className={styles.themeLabel}>Cool</p>
          <PokemonCard />
        </div>
        <div
          className={styles.themeDemo}
          style={
            { "--bone-base": "#2a2a2a", "--bone-highlight": "#3a3a3a" } as React.CSSProperties
          }
        >
          <p className={styles.themeLabel}>Dark</p>
          <PokemonCard />
        </div>
      </div>
    </DemoSection>
  );
}
