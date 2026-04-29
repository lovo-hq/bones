import type {
  PokeAPIListResponse,
  PokeAPIPokemonResponse,
  PokeAPISpeciesResponse,
  PokeAPIEvolutionChainResponse,
  PokeAPITypeResponse,
  PokeAPIMoveResponse,
  PokeAPIMachineResponse,
  PokeAPIEncounterResponse,
  EvolutionChainLink,
} from "./pokeapi-types";

export type { PokemonListItem } from "./pokeapi-types";
export type {
  PokemonData,
  PokemonStat,
  SpeciesData,
  EvolutionChain,
  EvolutionStage,
  TypeDefenseMap,
  MoveDetail,
  PokemonMoveEntry,
  EncounterLocation,
} from "./pokeapi-types";

import type {
  PokemonListItem,
  PokemonData,
  SpeciesData,
  EvolutionChain,
  EvolutionStage,
  TypeDefenseMap,
  MoveDetail,
  EncounterLocation,
} from "./pokeapi-types";

export interface PokemonDetail {
  id: number;
  name: string;
  sprite: string;
  artwork: string;
  types: string[];
  height: number;
  weight: number;
  description: string;
  stats: { name: string; value: number }[];
}

const BASE = "https://pokeapi.co/api/v2";

const ALL_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

// ============================================================
// Existing functions (preserved for backward compatibility)
// ============================================================

export async function fetchPokemonList(limit = 12, offset = 0): Promise<PokemonListItem[]> {
  const res = await fetch(`${BASE}/pokemon?limit=${limit}&offset=${offset}`);
  const data: PokeAPIListResponse = await res.json();

  const pokemon = await Promise.all(
    data.results.map(async (entry) => {
      const r = await fetch(entry.url);
      const p: PokeAPIPokemonResponse = await r.json();
      return {
        id: p.id,
        name: p.name,
        sprite: p.sprites.other["official-artwork"].front_default || p.sprites.front_default,
        types: p.types.map((t) => t.type.name),
      };
    }),
  );

  return pokemon;
}

export async function fetchPokemonDetail(id: string): Promise<PokemonDetail> {
  const [pokemonRes, speciesRes] = await Promise.all([
    fetch(`${BASE}/pokemon/${id}`),
    fetch(`${BASE}/pokemon-species/${id}`),
  ]);

  const pokemon: PokeAPIPokemonResponse = await pokemonRes.json();
  const species: PokeAPISpeciesResponse = await speciesRes.json();

  const englishEntry = species.flavor_text_entries.find((e) => e.language.name === "en");

  return {
    id: pokemon.id,
    name: pokemon.name,
    sprite:
      pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default,
    artwork: pokemon.sprites.other["official-artwork"].front_default,
    types: pokemon.types.map((t) => t.type.name),
    height: pokemon.height,
    weight: pokemon.weight,
    description: englishEntry ? englishEntry.flavor_text.replace(/\f|\n/g, " ") : "",
    stats: pokemon.stats.map((s) => ({
      name: s.stat.name,
      value: s.base_stat,
    })),
  };
}

// ============================================================
// New fetch functions
// ============================================================

export async function fetchPokemon(id: string): Promise<PokemonData> {
  const res = await fetch(`${BASE}/pokemon/${id}`);
  const p: PokeAPIPokemonResponse = await res.json();

  return {
    id: p.id,
    name: p.name,
    sprite: p.sprites.other["official-artwork"].front_default || p.sprites.front_default,
    artwork: p.sprites.other["official-artwork"].front_default,
    types: p.types.map((t) => t.type.name),
    height: p.height,
    weight: p.weight,
    baseExperience: p.base_experience,
    stats: p.stats.map((s) => ({
      name: s.stat.name,
      value: s.base_stat,
      effort: s.effort,
    })),
    moves: p.moves.map((m) => ({
      name: m.move.name,
      url: m.move.url,
      versionDetails: m.version_group_details.map((vgd) => ({
        levelLearnedAt: vgd.level_learned_at,
        learnMethod: vgd.move_learn_method.name,
        versionGroup: vgd.version_group.name,
      })),
    })),
  };
}

export async function fetchSpecies(id: string): Promise<SpeciesData> {
  const res = await fetch(`${BASE}/pokemon-species/${id}`);
  const s: PokeAPISpeciesResponse = await res.json();

  const genusEntry = s.genera.find((g) => g.language.name === "en");

  // Clean generation name: "generation-i" -> "I", "generation-vii" -> "VII"
  const generationName = s.generation.name.replace("generation-", "").toUpperCase();

  const englishFlavors = s.flavor_text_entries
    .filter((e) => e.language.name === "en")
    .map((e) => ({
      text: e.flavor_text.replace(/[\f\n]/g, " "),
      version: e.version.name,
    }));

  const firstEnglishText = englishFlavors.length > 0 ? englishFlavors[0].text : "";

  return {
    genderRate: s.gender_rate,
    captureRate: s.capture_rate,
    baseHappiness: s.base_happiness,
    hatchCounter: s.hatch_counter,
    growthRate: s.growth_rate.name,
    eggGroups: s.egg_groups.map((eg) => eg.name),
    genus: genusEntry ? genusEntry.genus : "",
    generation: generationName,
    habitat: s.habitat ? s.habitat.name : null,
    shape: s.shape ? s.shape.name : null,
    flavorTextEntries: englishFlavors,
    evolutionChainUrl: s.evolution_chain.url,
    description: firstEnglishText,
  };
}

// ============================================================
// Evolution chain helpers
// ============================================================

function extractIdFromUrl(url: string): string {
  const parts = url.replace(/\/$/, "").split("/");
  return parts[parts.length - 1];
}

function formatEvolutionTrigger(detail: EvolutionChainLink["evolution_details"][number]): string {
  if (!detail) return "";

  const trigger = detail.trigger.name;

  if (trigger === "level-up") {
    if (detail.min_level) return `Lv ${detail.min_level}`;
    if (detail.min_happiness) return `Friendship`;
    if (detail.time_of_day) return `Lv up (${detail.time_of_day})`;
    return "Level up";
  }

  if (trigger === "use-item" && detail.item) {
    return detail.item.name
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  if (trigger === "trade") {
    if (detail.held_item) {
      return `Trade (${detail.held_item.name
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")})`;
    }
    return "Trade";
  }

  return trigger
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function flattenChain(link: EvolutionChainLink): EvolutionStage[][] {
  const speciesId = extractIdFromUrl(link.species.url);
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${speciesId}.png`;

  const currentStage: EvolutionStage = {
    name: link.species.name,
    spriteUrl,
    trigger:
      link.evolution_details.length > 0 ? formatEvolutionTrigger(link.evolution_details[0]) : "",
  };

  if (link.evolves_to.length === 0) {
    return [[currentStage]];
  }

  const branches: EvolutionStage[][] = [];
  for (const next of link.evolves_to) {
    const subBranches = flattenChain(next);
    for (const branch of subBranches) {
      branches.push([currentStage, ...branch]);
    }
  }

  return branches;
}

export async function fetchEvolutionChain(url: string): Promise<EvolutionChain> {
  const res = await fetch(url);
  const data: PokeAPIEvolutionChainResponse = await res.json();

  const stages = flattenChain(data.chain);

  return { stages };
}

// ============================================================
// Type defenses (inline calculation — will be extracted in Task 3)
// ============================================================

export async function fetchTypeDefenses(types: string[]): Promise<TypeDefenseMap> {
  const typeResponses = await Promise.all(
    types.map(async (typeName) => {
      const res = await fetch(`${BASE}/type/${typeName}`);
      const data: PokeAPITypeResponse = await res.json();
      return data;
    }),
  );

  // Start with multiplier 1 for all 18 types
  const multipliers: Record<string, number> = {};
  for (const t of ALL_TYPES) {
    multipliers[t] = 1;
  }

  for (const typeData of typeResponses) {
    for (const t of typeData.damage_relations.double_damage_from) {
      if (t.name in multipliers) multipliers[t.name] *= 2;
    }
    for (const t of typeData.damage_relations.half_damage_from) {
      if (t.name in multipliers) multipliers[t.name] *= 0.5;
    }
    for (const t of typeData.damage_relations.no_damage_from) {
      if (t.name in multipliers) multipliers[t.name] = 0;
    }
  }

  const weakTo: { type: string; multiplier: number }[] = [];
  const resistantTo: { type: string; multiplier: number }[] = [];
  const neutral: string[] = [];
  const immuneTo: string[] = [];

  for (const [typeName, mult] of Object.entries(multipliers)) {
    if (mult === 0) {
      immuneTo.push(typeName);
    } else if (mult > 1) {
      weakTo.push({ type: typeName, multiplier: mult });
    } else if (mult < 1) {
      resistantTo.push({ type: typeName, multiplier: mult });
    } else {
      neutral.push(typeName);
    }
  }

  return { weakTo, resistantTo, neutral, immuneTo };
}

// ============================================================
// Encounters
// ============================================================

export async function fetchEncounters(id: string): Promise<EncounterLocation[]> {
  const res = await fetch(`${BASE}/pokemon/${id}/encounters`);
  const data: PokeAPIEncounterResponse[] = await res.json();

  const locations: EncounterLocation[] = [];

  for (const encounter of data) {
    const locationName = encounter.location_area.name.replace(/-/g, " ");

    for (const versionDetail of encounter.version_details) {
      for (const detail of versionDetail.encounter_details) {
        locations.push({
          location: locationName,
          version: versionDetail.version.name,
          method: detail.method.name,
          minLevel: detail.min_level,
          maxLevel: detail.max_level,
          chance: detail.chance,
        });
      }
    }
  }

  return locations;
}

// ============================================================
// Move details
// ============================================================

export async function fetchMoveDetails(moveUrls: string[]): Promise<Record<string, MoveDetail>> {
  // Deduplicate URLs
  const uniqueUrls = [...new Set(moveUrls)];

  const moves = await Promise.all(
    uniqueUrls.map(async (url) => {
      const res = await fetch(url);
      const data: PokeAPIMoveResponse = await res.json();
      return data;
    }),
  );

  // Collect all unique machine URLs across all moves
  const machineUrlMap = new Map<string, string[]>(); // machineUrl -> [moveName+versionGroup, ...]
  for (const move of moves) {
    for (const entry of move.machines) {
      const key = `${move.name}::${entry.version_group.name}`;
      const existing = machineUrlMap.get(entry.machine.url);
      if (existing) {
        existing.push(key);
      } else {
        machineUrlMap.set(entry.machine.url, [key]);
      }
    }
  }

  // Batch-fetch machine details to get TM/HM item names
  const machineEntries = [...machineUrlMap.entries()];
  const machineResponses = await Promise.all(
    machineEntries.map(async ([url]) => {
      const res = await fetch(url);
      const data: PokeAPIMachineResponse = await res.json();
      return data;
    }),
  );

  // Build move+versionGroup -> item name lookup
  const machineLookup = new Map<string, string>();
  for (let i = 0; i < machineEntries.length; i++) {
    const keys = machineEntries[i][1];
    const itemName = machineResponses[i].item.name.toUpperCase();
    for (const key of keys) {
      machineLookup.set(key, itemName);
    }
  }

  const result: Record<string, MoveDetail> = {};
  for (const move of moves) {
    const machineNumbers: Record<string, string> = {};
    for (const entry of move.machines) {
      const label = machineLookup.get(`${move.name}::${entry.version_group.name}`);
      if (label) {
        machineNumbers[entry.version_group.name] = label;
      }
    }

    result[move.name] = {
      name: move.name,
      type: move.type.name,
      power: move.power,
      accuracy: move.accuracy,
      pp: move.pp,
      damageClass: move.damage_class.name,
      machineNumbers,
    };
  }

  return result;
}
