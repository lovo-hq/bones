import { Bone, BoneImage } from "bones";
import Link from "next/link";
import type { PokemonListItem } from "@/lib/pokeapi";

/**
 * The same component serves both states:
 * - No `pokemon` prop → Bone/BoneImage children are undefined → skeletons render
 * - With `pokemon` prop → children are truthy → real content renders
 *
 * When wrapped in <Bones>, skeletons are forced regardless of children.
 */
export function PokemonCard({ pokemon }: { pokemon?: PokemonListItem }) {
  const card = (
    <div className="card">
      <BoneImage
        className="card-image"
        src={pokemon?.sprite}
        width={120}
        height={120}
        alt={pokemon?.name ?? "Pokemon"}
      />
      <Bone as="h3" className="card-name">
        {pokemon?.name}
      </Bone>
      <div className="card-types">
        {pokemon?.types ? (
          pokemon.types.map((type) => (
            <span key={type} className={`type-badge type-${type}`}>
              {type}
            </span>
          ))
        ) : (
          <>
            <Bone as="span" className="type-badge" width={56}>
              {undefined}
            </Bone>
          </>
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
