"use client";

import { useBone, useBones } from "bones";
import type { PokemonDetail } from "@/lib/pokeapi";

function StatBar({ name, value, loading }: { name?: string; value?: number; loading: boolean }) {
  const bone = useBone(loading);
  const pct = value !== undefined ? (value / 255) * 100 : 0;

  return (
    <div className="stat-row">
      <span {...bone("text")} className="stat-name" style={{ width: 100 }}>
        {name}
      </span>
      <span {...bone("text")} className="stat-value" style={{ width: 30 }}>
        {value !== undefined ? String(value) : undefined}
      </span>
      <div className="stat-bar-track">
        {loading ? (
          <div
            {...bone("block")}
            className="stat-bar-fill"
            style={{ width: "60%", height: 8 }}
          />
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

export function PokemonDetailView({
  pokemon,
}: {
  pokemon?: PokemonDetail;
}) {
  const { isLoading: forced } = useBones();
  const loading = forced || !pokemon;
  const bone = useBone(loading);

  return (
    <div className="detail">
      <div className="detail-header">
        <img
          {...bone("block")}
          className="detail-image"
          src={pokemon?.artwork}
          width={200}
          height={200}
          alt={pokemon?.name ?? "Pokemon"}
        />
        <div className="detail-info">
          <h1 {...bone("text")} className="detail-name">
            {pokemon?.name}
          </h1>
          <div className="detail-types">
            {pokemon?.types ? (
              pokemon.types.map((type) => (
                <span key={type} className={`type-badge type-${type}`}>
                  {type}
                </span>
              ))
            ) : (
              <>
                <span {...bone("text")} className="type-badge" style={{ width: 56 }} />
                <span {...bone("text")} className="type-badge" style={{ width: 56 }} />
              </>
            )}
          </div>
          <div className="detail-meta">
            <span {...bone("text")} className="meta-item">
              {pokemon ? `${pokemon.height / 10} m` : undefined}
            </span>
            <span {...bone("text")} className="meta-item">
              {pokemon ? `${pokemon.weight / 10} kg` : undefined}
            </span>
          </div>
        </div>
      </div>

      <section className="detail-section">
        <h2>Description</h2>
        <p {...bone("text", { lines: 3 })} className="detail-description">
          {pokemon?.description}
        </p>
      </section>

      <section className="detail-section">
        <h2>Base Stats</h2>
        <div className="stats">
          {pokemon?.stats ? (
            pokemon.stats.map((stat) => (
              <StatBar key={stat.name} name={stat.name} value={stat.value} loading={loading} />
            ))
          ) : (
            <>
              {Array.from({ length: 6 }, (_, i) => (
                <StatBar key={i} loading={loading} />
              ))}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
