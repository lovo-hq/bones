import styles from "./styles.module.css";

export function HeroSection() {
  return (
    <section className={styles.hero}>
      <h1>Bones</h1>
      <p className={styles.heroSubtitle}>
        Primitives for inline skeleton loaders in React.
        <br />
        Same component, both states.
      </p>
    </section>
  );
}
