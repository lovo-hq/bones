import { createBones } from "bones";
import Link from "next/link";
import type { PokemonListItem } from "@/lib/pokeapi";

export function PokemonCard({ pokemon }: { pokemon?: PokemonListItem }) {
  const { bone, repeat } = createBones(pokemon);

  const card = (
    <div className="card">
      <img
        className="card-image"
        src={pokemon?.sprite}
        width={120}
        height={120}
        alt={pokemon?.name ?? "Pokemon"}
        {...bone("block")}
      />
      <h3 className="card-name" {...bone("text", { length: 9 })}>
        {pokemon?.name}
      </h3>
      <div className="card-types">
        {repeat(pokemon?.types, 2).map((type, i) => (
          <span
            key={type || i}
            className={`type-badge${type ? ` type-${type}` : ""}`}
            {...bone("text", { contained: true, length: 7 })}
          >
            {type}
          </span>
        ))}
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
