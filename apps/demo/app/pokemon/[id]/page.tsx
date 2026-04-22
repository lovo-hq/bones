"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PokemonDetailView } from "@/components/pokemon-detail-view/pokemon-detail-view";
import toggleStyles from "@/components/skeleton-toggle/styles.module.css";
import { fetchPokemonDetail } from "@/lib/pokeapi";
import type { PokemonDetail } from "@/lib/pokeapi";
import styles from "./page.module.css";

export default function PokemonPage() {
  const params = useParams<{ id: string }>();
  const [pokemon, setPokemon] = useState<PokemonDetail>();
  const [showForced, setShowForced] = useState(false);

  useEffect(() => {
    fetchPokemonDetail(params.id).then(setPokemon);
  }, [params.id]);

  return (
    <main>
      <div className={styles.detailNav}>
        <Link href="/" className={styles.backLink}>
          ← Back to Pokédex
        </Link>
        {pokemon && (
          <button
            className={toggleStyles.toggleButton}
            onClick={() => setShowForced((prev) => !prev)}
          >
            {showForced ? "Show Content" : "Force Skeletons"}
          </button>
        )}
      </div>

      <div className={styles.sectionHeader}>
        <p className={styles.sectionDesc}>
          <strong>Client Component pattern:</strong> This page fetches data client-side. The same{" "}
          <code>PokemonDetailView</code> component renders skeletons when data is undefined, then
          real content when it arrives.
        </p>
      </div>

      <PokemonDetailView pokemon={showForced ? undefined : pokemon} />
    </main>
  );
}
