import { PokemonCard } from "./pokemon-card";
import type { PokemonListItem } from "@/lib/pokeapi";

export function PokemonGrid({ pokemon }: { pokemon?: PokemonListItem[] }) {
  return (
    <div className="grid">
      {pokemon
        ? pokemon.map((p) => <PokemonCard key={p.id} pokemon={p} />)
        : Array.from({ length: 12 }, (_, i) => <PokemonCard key={i} />)}
    </div>
  );
}
