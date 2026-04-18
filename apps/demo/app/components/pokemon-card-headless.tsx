"use client";

import { useBone } from "bones";
import type { PokemonListItem } from "@/lib/pokeapi";

export function PokemonCardHeadless({ pokemon }: { pokemon?: PokemonListItem }) {
  const bone = useBone(!pokemon);

  return (
    <div className="card">
      <img
        {...bone("block")}
        className="card-image"
        src={pokemon?.sprite}
        width={120}
        height={120}
        alt={pokemon?.name ?? "Pokemon"}
      />
      <h3 {...bone("text")} className="card-name">
        {pokemon?.name}
      </h3>
      <div className="card-types">
        {pokemon?.types ? (
          pokemon.types.map((type) => (
            <span key={type} className={`type-badge type-${type}`}>
              {type}
            </span>
          ))
        ) : (
          <span {...bone("text")} className="type-badge" style={{ width: "8ch" }} />
        )}
      </div>
    </div>
  );
}
