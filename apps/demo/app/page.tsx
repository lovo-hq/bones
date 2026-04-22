import { Suspense } from "react";
import { fetchPokemonList } from "@/lib/pokeapi";
import { ArticlePreview } from "./components/article-preview";
import { PokemonCard } from "./components/pokemon-card";
import { PokemonGrid } from "./components/pokemon-grid";
import { SkeletonToggle } from "./components/skeleton-toggle";

function delay<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve) => {
    promise.then((value) => setTimeout(() => resolve(value), ms));
  });
}

export default async function Home() {
  const pokemon = await fetchPokemonList(12);

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
          <h2>Streaming with Suspense</h2>
          <p className="section-desc">
            Pass a promise to <code>PokemonGrid</code> inside a{" "}
            <code>{"<Suspense>"}</code> boundary. The <strong>same component</strong> renders as
            skeletons in the fallback, then swaps to content when data resolves.
          </p>
          <p className="section-hint">Refresh the page to see the skeleton → content transition.</p>
        </div>

        <Suspense fallback={<PokemonGrid />}>
          <PokemonGrid pokemon={delay(Promise.resolve(pokemon), 2000)} />
        </Suspense>
      </section>

      <section className="demo-section">
        <div className="section-header">
          <h2>Forced Skeletons</h2>
          <p className="section-desc">
            Omit data to force skeleton mode. Toggle to see the same loaded cards switch to
            skeletons — no provider needed.
          </p>
        </div>

        <SkeletonToggle skeleton={<PokemonGrid />}>
          <PokemonGrid pokemon={pokemon} />
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
          <ArticlePreview />
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
            Customize skeleton colors with CSS custom properties. Zero-runtime — just override{" "}
            <code>--bone-base</code> and <code>--bone-highlight</code>.
          </p>
        </div>

        <div className="theme-demos">
          <div className="theme-demo" style={{ "--bone-base": "#f5e6d3", "--bone-highlight": "#faf0e6" } as React.CSSProperties}>
            <h3>Warm</h3>
            <PokemonCard />
          </div>
          <div className="theme-demo" style={{ "--bone-base": "#d3e5f5", "--bone-highlight": "#e6f0fa" } as React.CSSProperties}>
            <h3>Cool</h3>
            <PokemonCard />
          </div>
          <div className="theme-demo" style={{ "--bone-base": "#2a2a2a", "--bone-highlight": "#3a3a3a" } as React.CSSProperties}>
            <h3>Dark</h3>
            <PokemonCard />
          </div>
        </div>
      </section>
    </main>
  );
}
