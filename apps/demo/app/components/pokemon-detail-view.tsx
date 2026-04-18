"use client";

import { Bone, BoneImage, useBones } from "bones";
import type { PokemonDetail } from "@/lib/pokeapi";

function StatBar({ name, value }: { name?: string; value?: number }) {
  const { isLoading } = useBones();
  const pct = value !== undefined ? (value / 255) * 100 : 0;

  return (
    <div className="stat-row">
      <Bone as="span" className="stat-name" width={100}>
        {name}
      </Bone>
      <Bone as="span" className="stat-value" width={30}>
        {value !== undefined ? String(value) : undefined}
      </Bone>
      <div className="stat-bar-track">
        {isLoading ? (
          <Bone as="div" className="stat-bar-fill" width="60%" height={8}>
            {undefined}
          </Bone>
        ) : (
          <div
            className="stat-bar-fill loaded"
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Detailed Pokemon view. Works with both:
 * - Auto-detection: pass `pokemon` prop (undefined = skeleton, data = content)
 * - Forced mode: wrap in <Bones> provider to force skeleton regardless
 */
export function PokemonDetailView({
  pokemon,
}: {
  pokemon?: PokemonDetail;
}) {
  return (
    <div className="detail">
      <div className="detail-header">
        <BoneImage
          className="detail-image"
          src={pokemon?.artwork}
          width={200}
          height={200}
          alt={pokemon?.name ?? "Pokemon"}
        />
        <div className="detail-info">
          <Bone as="h1" className="detail-name">
            {pokemon?.name}
          </Bone>
          <div className="detail-types">
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
                <Bone as="span" className="type-badge" width={56}>
                  {undefined}
                </Bone>
              </>
            )}
          </div>
          <div className="detail-meta">
            <Bone as="span" className="meta-item">
              {pokemon ? `${pokemon.height / 10} m` : undefined}
            </Bone>
            <Bone as="span" className="meta-item">
              {pokemon ? `${pokemon.weight / 10} kg` : undefined}
            </Bone>
          </div>
        </div>
      </div>

      <section className="detail-section">
        <h2>Description</h2>
        <Bone as="p" className="detail-description" lines={3}>
          {pokemon?.description}
        </Bone>
      </section>

      <section className="detail-section">
        <h2>Base Stats</h2>
        <div className="stats">
          {pokemon?.stats ? (
            pokemon.stats.map((stat) => (
              <StatBar key={stat.name} name={stat.name} value={stat.value} />
            ))
          ) : (
            <>
              {Array.from({ length: 6 }, (_, i) => (
                <StatBar key={i} />
              ))}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
