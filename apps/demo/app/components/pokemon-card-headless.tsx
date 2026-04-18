"use client";

import { useBone } from "bones";
import type { PokemonListItem } from "@/lib/pokeapi";

const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export function PokemonCardHeadless({
  pokemon,
}: {
  pokemon?: PokemonListItem;
}) {
  const bone = useBone(!pokemon);

  const imgProps = bone();
  const headingProps = bone();
  const badgeProps = bone({ width: "8ch" });

  return (
    <div className="card">
      <img
        {...imgProps}
        className={["card-image", imgProps.className]
          .filter(Boolean)
          .join(" ")}
        src={pokemon?.sprite ?? TRANSPARENT_PIXEL}
        width={120}
        height={120}
        alt={pokemon?.name ?? "Pokemon"}
      />
      <h3
        {...headingProps}
        className={["card-name", headingProps.className]
          .filter(Boolean)
          .join(" ")}
      >
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
            {...badgeProps}
            className={["type-badge", badgeProps.className]
              .filter(Boolean)
              .join(" ")}
          >
            {undefined}
          </span>
        )}
      </div>
    </div>
  );
}
