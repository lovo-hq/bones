import { createBones } from "bones";
import type { PokemonDetail } from "@/lib/pokeapi";

function StatBar({ stat }: { stat?: { name: string; value: number } }) {
  const { bone } = createBones(stat);
  const pct = stat ? (stat.value / 255) * 100 : 0;

  return (
    <div className="stat-row">
      <span className="stat-name" style={{ width: 100 }} {...bone("text")}>
        {stat?.name}
      </span>
      <span className="stat-value" style={{ width: 30 }} {...bone("text")}>
        {stat ? String(stat.value) : undefined}
      </span>
      <div className="stat-bar-track">
        {stat ? (
          <div className="stat-bar-fill loaded" style={{ width: `${pct}%` }} />
        ) : (
          <div className="stat-bar-fill" style={{ width: "60%", height: 8 }} {...bone("block")} />
        )}
      </div>
    </div>
  );
}

export function PokemonDetailView({ pokemon }: { pokemon?: PokemonDetail }) {
  const { bone } = createBones(pokemon);

  return (
    <div className="detail">
      <div className="detail-header">
        <img
          className="detail-image"
          src={pokemon?.artwork}
          width={200}
          height={200}
          alt={pokemon?.name ?? "Pokemon"}
          {...bone("block")}
        />
        <div className="detail-info">
          <h1 className="detail-name" {...bone("text")}>
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
                <span className="type-badge" style={{ width: 56 }} {...bone("text")} />
                <span className="type-badge" style={{ width: 56 }} {...bone("text")} />
              </>
            )}
          </div>
          <div className="detail-meta">
            <span className="meta-item" {...bone("text")}>
              {pokemon ? `${pokemon.height / 10} m` : undefined}
            </span>
            <span className="meta-item" {...bone("text")}>
              {pokemon ? `${pokemon.weight / 10} kg` : undefined}
            </span>
          </div>
        </div>
      </div>

      <section className="detail-section">
        <h2>Description</h2>
        <p className="detail-description" {...bone("text", { lines: 3 })}>
          {pokemon?.description}
        </p>
      </section>

      <section className="detail-section">
        <h2>Base Stats</h2>
        <div className="stats">
          {pokemon?.stats ? (
            pokemon.stats.map((stat) => <StatBar key={stat.name} stat={stat} />)
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
