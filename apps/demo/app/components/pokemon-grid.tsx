import { createBones } from "bones";
import { PokemonCard } from "./pokemon-card";
import type { PokemonListItem } from "@/lib/pokeapi";

export function PokemonGrid({
  pokemon,
}: {
  pokemon?: PokemonListItem[] | Promise<PokemonListItem[]>;
}) {
  const { repeat, data } = createBones(pokemon);

  return (
    <div className="grid">
      {repeat(data, 12).map((p, i) => (
        <PokemonCard key={p?.id ?? i} pokemon={p} />
      ))}
    </div>
  );
}
