"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Bones } from "bones";
import Link from "next/link";
import { PokemonDetailView } from "@/components/pokemon-detail-view";
import type { PokemonDetail } from "@/lib/pokeapi";

/**
 * Client Component pattern:
 *
 * This page fetches data client-side using useEffect.
 * PokemonDetailView starts with no data — useBone returns skeleton
 * classes so placeholders render automatically. No Suspense needed.
 *
 * When data arrives, useBone returns empty props → content renders.
 */
export default function PokemonPage() {
  const params = useParams<{ id: string }>();
  const [pokemon, setPokemon] = useState<PokemonDetail>();
  const [showForced, setShowForced] = useState(false);

  useEffect(() => {
    async function load() {
      const [pokemonRes, speciesRes] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${params.id}`),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${params.id}`),
      ]);

      const pokemonData = await pokemonRes.json();
      const speciesData = await speciesRes.json();

      const englishEntry = speciesData.flavor_text_entries.find(
        (e: { language: { name: string } }) => e.language.name === "en",
      );

      setPokemon({
        id: pokemonData.id,
        name: pokemonData.name,
        sprite:
          pokemonData.sprites.other["official-artwork"].front_default ||
          pokemonData.sprites.front_default,
        artwork: pokemonData.sprites.other["official-artwork"].front_default,
        types: pokemonData.types.map((t: { type: { name: string } }) => t.type.name),
        height: pokemonData.height,
        weight: pokemonData.weight,
        description: englishEntry ? englishEntry.flavor_text.replace(/\f|\n/g, " ") : "",
        stats: pokemonData.stats.map((s: { base_stat: number; stat: { name: string } }) => ({
          name: s.stat.name,
          value: s.base_stat,
        })),
      });
    }

    load();
  }, [params.id]);

  const detail = <PokemonDetailView pokemon={pokemon} />;

  return (
    <main>
      <div className="detail-nav">
        <Link href="/" className="back-link">
          ← Back to Pokédex
        </Link>
        {pokemon && (
          <button className="toggle-button" onClick={() => setShowForced((prev) => !prev)}>
            {showForced ? "Show Content" : "Force Skeletons"}
          </button>
        )}
      </div>

      <div className="section-header">
        <p className="section-desc">
          <strong>Client Component pattern:</strong> This page fetches data client-side. The same{" "}
          <code>PokemonDetailView</code> component renders skeletons when data is undefined, then
          real content when it arrives. The <code>useBones()</code> hook drives custom stat bar
          rendering.
        </p>
      </div>

      {showForced ? <Bones>{detail}</Bones> : detail}
    </main>
  );
}
