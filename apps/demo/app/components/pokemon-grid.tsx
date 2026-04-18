import { fetchPokemonList } from "@/lib/pokeapi";
import { PokemonCard } from "./pokemon-card";

/**
 * Skeleton grid — renders 12 empty PokemonCards as placeholders.
 * Used as a Suspense fallback while PokemonGridAsync loads.
 */
export function PokemonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid">
      {Array.from({ length: count }, (_, i) => (
        <PokemonCard key={i} />
      ))}
    </div>
  );
}

/**
 * Async server component — fetches data then renders.
 * While this component is loading, React shows the Suspense fallback.
 */
export async function PokemonGridAsync({ delay = 0 }: { delay?: number }) {
  if (delay > 0) {
    await new Promise((r) => setTimeout(r, delay));
  }

  const pokemon = await fetchPokemonList(12);

  return (
    <div className="grid">
      {pokemon.map((p) => (
        <PokemonCard key={p.id} pokemon={p} />
      ))}
    </div>
  );
}
