import styles from "./styles.module.css";

export function HeroSection() {
  return (
    <section className={styles.hero}>
      <h1>bones</h1>
      <p className={styles.heroSubtitle}>
        Skeleton loaders designed for React Server Components and streaming.
      </p>
    </section>
  );
}
