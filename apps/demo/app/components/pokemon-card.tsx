"use client";

import { useBone } from "bones";
import Link from "next/link";
import type { PokemonListItem } from "@/lib/pokeapi";

export function PokemonCard({ pokemon }: { pokemon?: PokemonListItem }) {
  const bone = useBone(!pokemon);

  const card = (
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
          <span
            {...bone("text")}
            className="type-badge"
            style={{ width: 56 }}
          />
        )}
      </div>
    </div>
  );

  if (pokemon) {
    return (
      <Link href={`/pokemon/${pokemon.id}`} className="card-link">
        {card}
      </Link>
    );
  }

  return card;
}
