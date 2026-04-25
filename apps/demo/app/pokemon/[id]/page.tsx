import { Bones } from "bones";
import Link from "next/link";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { delay } from "@/lib/delay";
import { getDelays } from "@/lib/demo-delays";
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
  return (
    stats
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
      .join(", ") || "None"
  );
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

async function TabsSectionData({
  pokemonPromise,
  speciesPromise,
  encountersPromise,
}: {
  pokemonPromise: Promise<PokemonData>;
  speciesPromise: Promise<SpeciesData>;
  encountersPromise: Promise<EncounterLocation[]>;
}) {
  const [pokemon, species, encounters] = await Promise.all([
    pokemonPromise,
    speciesPromise,
    encountersPromise,
  ]);
  const moveDetails = await fetchMoveDetails(pokemon.moves.map((m) => m.url));

  return (
    <TabsSection
      moves={pokemon.moves}
      moveDetails={moveDetails}
      flavorTextEntries={species.flavorTextEntries}
      encounters={encounters}
    />
  );
}

export default async function PokemonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const delays = getDelays(cookieStore.get("bones-delays")?.value);

  // Independent fetches — each powers a different Suspense boundary
  const pokemonPromise = delay(fetchPokemon(id), delays.pokemon);
  const speciesPromise = delay(fetchSpecies(id), delays.species);
  const typeDefensePromise = pokemonPromise.then((p) =>
    delay(fetchTypeDefenses(p.types), delays.typeDefense),
  );
  const evolutionPromise = speciesPromise.then((s) =>
    delay(fetchEvolutionChain(s.evolutionChainUrl), delays.evolution),
  );
  const encountersPromise = delay(fetchEncounters(id), delays.encounters);

  // Derived promises for InfoCard rows
  const trainingPromise = Promise.all([pokemonPromise, speciesPromise]).then(([p, s]) =>
    trainingRows(p, s),
  );
  const breedingPromise = speciesPromise.then((s) => breedingRows(s));
  const pokedexPromise = speciesPromise.then((s) => pokedexRows(s));

  return (
    <main>
      <div className={styles.detailNav}>
        <Link href="/" className={styles.backLink}>
          ← Back to Pokédex
        </Link>
      </div>

      <Bones>
        <PokemonHero pokemon={pokemonPromise} species={speciesPromise} />
      </Bones>

      <div className={styles.bentoGrid}>
        <div className={styles.bentoRow1}>
          <Bones>
            <BaseStatsCard pokemon={pokemonPromise} />
          </Bones>
          <Bones>
            <TypeDefenseCard typeDefense={typeDefensePromise} />
          </Bones>
        </div>

        <div className={styles.bentoRow2}>
          <Bones>
            <InfoCard title="Training" rows={trainingPromise} />
          </Bones>
          <Bones>
            <InfoCard title="Breeding" rows={breedingPromise} />
          </Bones>
          <Bones>
            <InfoCard title="Pokedex Data" rows={pokedexPromise} />
          </Bones>
        </div>

        <Bones>
          <EvolutionChainCard chain={evolutionPromise} currentName={id} />
        </Bones>
      </div>

      <Suspense>
        <TabsSectionData
          pokemonPromise={pokemonPromise}
          speciesPromise={speciesPromise}
          encountersPromise={encountersPromise}
        />
      </Suspense>
    </main>
  );
}
