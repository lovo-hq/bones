import { BonesForce } from "bones";
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
        <BonesForce>
          <div
            className={styles.themeDemo}
            style={{
              "--bone-base": "rgba(180, 120, 60, 0.15)",
              "--bone-highlight": "rgba(180, 120, 60, 0.08)",
            }}
          >
            <h3>Warm</h3>
            <PokemonCard />
          </div>
          <div
            className={styles.themeDemo}
            style={{
              "--bone-base": "rgba(60, 120, 180, 0.15)",
              "--bone-highlight": "rgba(60, 120, 180, 0.08)",
            }}
          >
            <h3>Cool</h3>
            <PokemonCard />
          </div>
          <div
            className={styles.themeDemo}
            style={{
              "--bone-base": "rgba(255, 255, 255, 0.12)",
              "--bone-highlight": "rgba(255, 255, 255, 0.06)",
            }}
          >
            <h3>Dark</h3>
            <PokemonCard />
          </div>
        </BonesForce>
      </div>
    </DemoSection>
  );
}
