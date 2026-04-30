// ============================================================
// PokeAPI raw response types
// ============================================================

export interface PokeAPIListResponse {
  results: { name: string; url: string }[];
}

export interface PokeAPIPokemonResponse {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
  types: {
    slot: number;
    type: { name: string; url: string };
  }[];
  height: number;
  weight: number;
  base_experience: number;
  stats: {
    base_stat: number;
    effort: number;
    stat: { name: string; url: string };
  }[];
  moves: {
    move: { name: string; url: string };
    version_group_details: {
      level_learned_at: number;
      move_learn_method: { name: string; url: string };
      version_group: { name: string; url: string };
    }[];
  }[];
}

export interface PokeAPISpeciesResponse {
  id: number;
  name: string;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number;
  hatch_counter: number;
  growth_rate: { name: string; url: string };
  egg_groups: { name: string; url: string }[];
  genera: {
    genus: string;
    language: { name: string; url: string };
  }[];
  generation: { name: string; url: string };
  habitat: { name: string; url: string } | null;
  shape: { name: string; url: string } | null;
  flavor_text_entries: {
    flavor_text: string;
    language: { name: string; url: string };
    version: { name: string; url: string };
  }[];
  evolution_chain: { url: string };
}

export interface EvolutionChainLink {
  species: { name: string; url: string };
  evolution_details: {
    min_level: number | null;
    trigger: { name: string; url: string };
    item: { name: string; url: string } | null;
    held_item: { name: string; url: string } | null;
    known_move: { name: string; url: string } | null;
    min_happiness: number | null;
    min_beauty: number | null;
    min_affection: number | null;
    needs_overworld_rain: boolean;
    time_of_day: string;
    relative_physical_stats: number | null;
    turn_upside_down: boolean;
  }[];
  evolves_to: EvolutionChainLink[];
}

export interface PokeAPIEvolutionChainResponse {
  chain: EvolutionChainLink;
}

export interface PokeAPITypeResponse {
  name: string;
  damage_relations: {
    double_damage_from: { name: string; url: string }[];
    half_damage_from: { name: string; url: string }[];
    no_damage_from: { name: string; url: string }[];
    double_damage_to: { name: string; url: string }[];
    half_damage_to: { name: string; url: string }[];
    no_damage_to: { name: string; url: string }[];
  };
}

export interface PokeAPIMoveResponse {
  name: string;
  type: { name: string; url: string };
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  damage_class: { name: string; url: string };
  machines: {
    machine: { url: string };
    version_group: { name: string };
  }[];
}

export interface PokeAPIMachineResponse {
  id: number;
  item: { name: string };
}

export interface PokeAPIEncounterResponse {
  location_area: { name: string; url: string };
  version_details: {
    version: { name: string; url: string };
    max_chance: number;
    encounter_details: {
      min_level: number;
      max_level: number;
      chance: number;
      method: { name: string; url: string };
      condition_values: { name: string; url: string }[];
    }[];
  }[];
}

// ============================================================
// App-level data types (transformed)
// ============================================================

export interface PokemonListItem {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

interface PokemonStat {
  name: string;
  value: number;
  effort: number;
}

export interface PokemonMoveEntry {
  name: string;
  url: string;
  versionDetails: {
    levelLearnedAt: number;
    learnMethod: string;
    versionGroup: string;
  }[];
}

export interface PokemonData {
  id: number;
  name: string;
  sprite: string;
  artwork: string;
  types: string[];
  height: number;
  weight: number;
  baseExperience: number;
  stats: PokemonStat[];
  moves: PokemonMoveEntry[];
}

export interface SpeciesData {
  genderRate: number;
  captureRate: number;
  baseHappiness: number;
  hatchCounter: number;
  growthRate: string;
  eggGroups: string[];
  genus: string;
  generation: string;
  habitat: string | null;
  shape: string | null;
  flavorTextEntries: {
    text: string;
    version: string;
  }[];
  evolutionChainUrl: string;
  description: string;
}

export interface EvolutionStage {
  name: string;
  spriteUrl: string;
  trigger: string;
}

export interface EvolutionChain {
  /** Array of branches; each branch is an ordered array of evolution stages */
  stages: EvolutionStage[][];
}

export interface TypeDefenseMap {
  weakTo: { type: string; multiplier: number }[];
  resistantTo: { type: string; multiplier: number }[];
  neutral: string[];
  immuneTo: string[];
}

export interface MoveDetail {
  name: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  damageClass: string;
  machineNumbers: Record<string, string>;
}

export interface EncounterLocation {
  location: string;
  version: string;
  method: string;
  minLevel: number;
  maxLevel: number;
  chance: number;
}
