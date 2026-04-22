"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PokemonDetailView } from "@/components/pokemon-detail-view";
import { fetchPokemonDetail } from "@/lib/pokeapi";
import type { PokemonDetail } from "@/lib/pokeapi";

export default function PokemonPage() {
  const params = useParams<{ id: string }>();
  const [pokemon, setPokemon] = useState<PokemonDetail>();
  const [showForced, setShowForced] = useState(false);

  useEffect(() => {
    fetchPokemonDetail(params.id).then(setPokemon);
  }, [params.id]);

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
          real content when it arrives.
        </p>
      </div>

      <PokemonDetailView pokemon={showForced ? undefined : pokemon} />
    </main>
  );
}
