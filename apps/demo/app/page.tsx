import { Bones } from "bones";
import type { PokemonListItem } from "@/lib/pokeapi";
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

export default function Home() {
  const pokemonPromise = fetchPokemonList(12);

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
          <h2>Streaming with {"<Bones>"}</h2>
          <p className="section-desc">
            Pass a promise to <code>{"<Bones>"}</code> and it handles the rest — Suspense, fallback,
            and transition are all internal. The <strong>same PokemonCard</strong> component renders
            as a skeleton while the data streams in, then swaps to content when it resolves.
          </p>
          <p className="section-hint">Refresh the page to see the skeleton → content transition.</p>
        </div>

        <Bones value={delay(pokemonPromise, 2000)}>
          {(pokemon: PokemonListItem[] | undefined) => <PokemonGrid pokemon={pokemon} />}
        </Bones>
      </section>

      <section className="demo-section">
        <div className="section-header">
          <h2>{"<Bones forced>"}</h2>
          <p className="section-desc">
            The <code>forced</code> prop forces <strong>all</strong> nested <code>useBone</code>{" "}
            hooks into skeleton mode — even when they have real data. Toggle it to see the same
            loaded cards switch to skeletons.
          </p>
        </div>

        <SkeletonToggle>
          <Bones value={pokemonPromise}>
            {(pokemon: PokemonListItem[] | undefined) => <PokemonGrid pokemon={pokemon} />}
          </Bones>
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
