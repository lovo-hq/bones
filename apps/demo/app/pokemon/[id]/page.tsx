import { Bones } from "bones";
import Link from "next/link";
import { delay } from "@/lib/delay";
import {
  fetchPokemon,
  fetchSpecies,
  fetchEvolutionChain,
  fetchTypeDefenses,
  fetchEncounters,
  fetchMoveDetails,
} from "@/lib/pokeapi";
import type { PokemonData, SpeciesData, EncounterLocation } from "@/lib/pokeapi";
import { PokemonHero } from "@/components/pokemon-hero/pokemon-hero";
import { BaseStatsCard } from "@/components/base-stats-card/base-stats-card";
import { TypeDefenseCard } from "@/components/type-defense-card/type-defense-card";
import { InfoCard } from "@/components/info-card/info-card";
import { EvolutionChainCard } from "@/components/evolution-chain-card/evolution-chain-card";
import { TabsSection } from "./tabs-section";
import styles from "./page.module.css";

function formatGender(rate: number): string {
  if (rate === -1) return "Genderless";
  const female = (rate / 8) * 100;
  const male = 100 - female;
  return `\u2642 ${male}% / \u2640 ${female}%`;
}

function formatEvYield(stats: PokemonData["stats"]): string {
  return stats
    .filter((s) => s.effort > 0)
    .map((s) => {
      const name = s.name
        .replace("special-attack", "Sp. Atk")
        .replace("special-defense", "Sp. Def")
        .replace("attack", "Atk")
        .replace("defense", "Def")
        .replace("speed", "Speed")
        .replace("hp", "HP");
      return `${s.effort} ${name}`;
    })
    .join(", ") || "None";
}

function trainingRows(pokemon: PokemonData, species: SpeciesData) {
  return [
    { label: "EV Yield", value: formatEvYield(pokemon.stats) },
    { label: "Catch Rate", value: String(species.captureRate) },
    { label: "Base Exp", value: String(pokemon.baseExperience) },
    { label: "Growth", value: species.growthRate.replace(/-/g, " ") },
  ];
}

function breedingRows(species: SpeciesData) {
  return [
    { label: "Egg Groups", value: species.eggGroups.join(", ") },
    { label: "Gender", value: formatGender(species.genderRate) },
    { label: "Egg Cycles", value: String(species.hatchCounter) },
    { label: "Friendship", value: String(species.baseHappiness) },
  ];
}

function pokedexRows(species: SpeciesData) {
  return [
    { label: "Species", value: species.genus },
    { label: "Generation", value: species.generation },
    { label: "Habitat", value: species.habitat ?? "Unknown" },
    { label: "Shape", value: species.shape ?? "Unknown" },
  ];
}

export default async function PokemonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Independent fetches — each powers different Suspense boundaries
  const pokemonPromise = delay(fetchPokemon(id), 800);
  const speciesPromise = delay(fetchSpecies(id), 1000);
  const typeDefensePromise = pokemonPromise.then((p) => fetchTypeDefenses(p.types));
  const evolutionPromise = speciesPromise.then((s) => fetchEvolutionChain(s.evolutionChainUrl));
  const encountersPromise = fetchEncounters(id);

  // Await pokemon + species for data transformations needed by InfoCards and TabsSection
  const pokemon = await pokemonPromise;
  const species = await speciesPromise;

  // Fetch all move details in parallel
  const moveUrls = pokemon.moves.map((m) => m.url);
  const moveDetails = await fetchMoveDetails(moveUrls);
  const encounters = await encountersPromise;

  return (
    <main>
      <div className={styles.detailNav}>
        <Link href="/" className={styles.backLink}>
          ← Back to Pokédex
        </Link>
      </div>

      <PokemonHero pokemon={pokemon} species={species} />

      <div className={styles.bentoGrid}>
        <div className={styles.bentoRow1}>
          <BaseStatsCard pokemon={pokemon} />
          <Bones>
            <TypeDefenseCard typeDefense={typeDefensePromise} />
          </Bones>
        </div>

        <div className={styles.bentoRow2}>
          <InfoCard title="Training" rows={trainingRows(pokemon, species)} />
          <InfoCard title="Breeding" rows={breedingRows(species)} />
          <InfoCard title="Pokedex Data" rows={pokedexRows(species)} />
        </div>

        <Bones>
          <EvolutionChainCard chain={evolutionPromise} currentName={pokemon.name} />
        </Bones>
      </div>

      <TabsSection
        moves={pokemon.moves}
        moveDetails={moveDetails}
        flavorTextEntries={species.flavorTextEntries}
        encounters={encounters}
      />
    </main>
  );
}
