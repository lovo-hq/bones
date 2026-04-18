import { Suspense } from "react";
import { Bones } from "bones";
import { PokemonCard } from "./components/pokemon-card";
import { PokemonGrid, PokemonGridAsync } from "./components/pokemon-grid";
import { PokemonCardHeadless } from "./components/pokemon-card-headless";
import { SkeletonToggle } from "./components/skeleton-toggle";

/**
 * Server Component pattern:
 *
 * <PokemonGrid> is an async server component that fetches data.
 * While it loads, React renders the Suspense fallback — which uses
 * the SAME <PokemonCard> component, but without data.
 *
 * Since pokemon prop is undefined, all <Bone> and <BoneImage>
 * children are falsy → skeletons render automatically.
 *
 * The 2-second delay lets you see the skeleton in action.
 */
export default function Home() {
  return (
    <main>
      <section className="hero">
        <h1>Bones</h1>
        <p className="hero-subtitle">
          Primitives for inline skeleton loaders in React.
          <br />
          Same component, both states.
        </p>
      </section>

      <section className="demo-section">
        <div className="section-header">
          <h2>Server Components + Suspense</h2>
          <p className="section-desc">
            An async server component fetches Pokemon data. While it streams in,
            the Suspense fallback renders the <strong>same PokemonCard</strong>{" "}
            component — but without data. Bone auto-detects the empty children
            and shows skeletons.
          </p>
          <p className="section-hint">
            Refresh the page to see the skeleton → content transition.
          </p>
        </div>

        <Suspense fallback={<PokemonGrid />}>
          <PokemonGridAsync delay={2000} />
        </Suspense>
      </section>

      <section className="demo-section">
        <div className="section-header">
          <h2>
            {"<Bones>"} Provider
          </h2>
          <p className="section-desc">
            The <code>{"<Bones>"}</code> context provider forces{" "}
            <strong>all</strong> nested Bone components into skeleton mode — even
            when they have real data. Toggle it to see the same loaded cards
            switch to skeletons.
          </p>
        </div>

        <SkeletonToggle>
          <Suspense fallback={<PokemonGrid />}>
            <PokemonGridAsync />
          </Suspense>
        </SkeletonToggle>
      </section>

      <section className="demo-section">
        <div className="section-header">
          <h2>Theming</h2>
          <p className="section-desc">
            Customize skeleton colors with the <code>baseColor</code> and{" "}
            <code>highlightColor</code> props on the{" "}
            <code>{"<Bones>"}</code> provider. Zero-runtime — just CSS custom
            properties.
          </p>
        </div>

        <div className="theme-demos">
          <div className="theme-demo">
            <h3>Warm</h3>
            <Bones baseColor="#f5e6d3" highlightColor="#faf0e6">
              <PokemonCard />
            </Bones>
          </div>
          <div className="theme-demo">
            <h3>Cool</h3>
            <Bones baseColor="#d3e5f5" highlightColor="#e6f0fa">
              <PokemonCard />
            </Bones>
          </div>
          <div className="theme-demo">
            <h3>Dark</h3>
            <Bones baseColor="#2a2a2a" highlightColor="#3a3a3a">
              <PokemonCard />
            </Bones>
          </div>
        </div>
      </section>

      <section className="demo-section">
        <div className="section-header">
          <h2>Headless Mode (useBone)</h2>
          <p className="section-desc">
            The <code>useBone</code> hook returns a prop getter that applies
            skeleton styles to <strong>plain HTML elements</strong> — no
            wrapper components needed. Same loading detection, zero extra DOM.
          </p>
        </div>

        <div className="grid">
          <PokemonCardHeadless />
          <PokemonCardHeadless />
          <PokemonCardHeadless />
        </div>
      </section>
    </main>
  );
}
