import { Suspense } from "react";
import { Bones } from "bones";
import { ArticlePreview } from "./components/article-preview";
import { PokemonCard } from "./components/pokemon-card";
import { PokemonGrid, PokemonGridAsync } from "./components/pokemon-grid";
import { SkeletonToggle } from "./components/skeleton-toggle";

/**
 * Server Component pattern:
 *
 * <PokemonGrid> is an async server component that fetches data.
 * While it loads, React renders the Suspense fallback — which uses
 * the SAME <PokemonCard> component, but without data.
 *
 * Since pokemon prop is undefined, useBone returns skeleton classes
 * and the cards render as placeholders automatically.
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
            An async server component fetches Pokemon data. While it streams in, the Suspense
            fallback renders the <strong>same PokemonCard</strong> component — but without data.
            Bone auto-detects the empty children and shows skeletons.
          </p>
          <p className="section-hint">Refresh the page to see the skeleton → content transition.</p>
        </div>

        <Suspense fallback={<PokemonGrid />}>
          <PokemonGridAsync delay={2000} />
        </Suspense>
      </section>

      <section className="demo-section">
        <div className="section-header">
          <h2>{"<Bones>"} Provider</h2>
          <p className="section-desc">
            The <code>{"<Bones>"}</code> context provider forces <strong>all</strong> nested{" "}
            <code>useBone</code> hooks into skeleton mode — even when they have real data. Toggle it
            to see the same loaded cards switch to skeletons.
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
          <h2>Multi-Line Text</h2>
          <p className="section-desc">
            Pass <code>{"{ lines: N }"}</code> to <code>bone("text")</code> to create
            paragraph-sized placeholders. The skeleton automatically generates one bar per line
            using a CSS repeating gradient — no extra DOM elements.
          </p>
        </div>

        <div className="article-demos">
          <Bones forced>
            <ArticlePreview />
          </Bones>
          <ArticlePreview
            article={{
              title: "Understanding React Server Components",
              excerpt:
                "Server Components let you render components on the server, reducing the JavaScript sent to the client. This changes how we think about data fetching and component architecture.",
              author: "Dan Abramov",
              date: "Mar 2026",
            }}
          />
        </div>
      </section>

      <section className="demo-section">
        <div className="section-header">
          <h2>Theming</h2>
          <p className="section-desc">
            Customize skeleton colors with the <code>baseColor</code> and{" "}
            <code>highlightColor</code> props on the <code>{"<Bones>"}</code> provider. Zero-runtime
            — just CSS custom properties.
          </p>
        </div>

        <div className="theme-demos">
          <div className="theme-demo">
            <h3>Warm</h3>
            <Bones forced baseColor="#f5e6d3" highlightColor="#faf0e6">
              <PokemonCard />
            </Bones>
          </div>
          <div className="theme-demo">
            <h3>Cool</h3>
            <Bones forced baseColor="#d3e5f5" highlightColor="#e6f0fa">
              <PokemonCard />
            </Bones>
          </div>
          <div className="theme-demo">
            <h3>Dark</h3>
            <Bones forced baseColor="#2a2a2a" highlightColor="#3a3a3a">
              <PokemonCard />
            </Bones>
          </div>
        </div>
      </section>
    </main>
  );
}
