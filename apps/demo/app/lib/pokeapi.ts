export interface PokemonListItem {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

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

interface PokeAPIListResponse {
  results: { name: string; url: string }[];
}

interface PokeAPIPokemonResponse {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other: { "official-artwork": { front_default: string } };
  };
  types: { type: { name: string } }[];
  height: number;
  weight: number;
  stats: { base_stat: number; stat: { name: string } }[];
}

interface PokeAPISpeciesResponse {
  flavor_text_entries: {
    flavor_text: string;
    language: { name: string };
    version: { name: string };
  }[];
}

const BASE = "https://pokeapi.co/api/v2";

export async function fetchPokemonList(
  limit = 12,
  offset = 0,
): Promise<PokemonListItem[]> {
  const res = await fetch(`${BASE}/pokemon?limit=${limit}&offset=${offset}`);
  const data: PokeAPIListResponse = await res.json();

  const pokemon = await Promise.all(
    data.results.map(async (entry) => {
      const r = await fetch(entry.url);
      const p: PokeAPIPokemonResponse = await r.json();
      return {
        id: p.id,
        name: p.name,
        sprite:
          p.sprites.other["official-artwork"].front_default ||
          p.sprites.front_default,
        types: p.types.map((t) => t.type.name),
      };
    }),
  );

  return pokemon;
}

export async function fetchPokemonDetail(
  id: string,
): Promise<PokemonDetail> {
  const [pokemonRes, speciesRes] = await Promise.all([
    fetch(`${BASE}/pokemon/${id}`),
    fetch(`${BASE}/pokemon-species/${id}`),
  ]);

  const pokemon: PokeAPIPokemonResponse = await pokemonRes.json();
  const species: PokeAPISpeciesResponse = await speciesRes.json();

  const englishEntry = species.flavor_text_entries.find(
    (e) => e.language.name === "en",
  );

  return {
    id: pokemon.id,
    name: pokemon.name,
    sprite:
      pokemon.sprites.other["official-artwork"].front_default ||
      pokemon.sprites.front_default,
    artwork: pokemon.sprites.other["official-artwork"].front_default,
    types: pokemon.types.map((t) => t.type.name),
    height: pokemon.height,
    weight: pokemon.weight,
    description: englishEntry
      ? englishEntry.flavor_text.replace(/\f|\n/g, " ")
      : "",
    stats: pokemon.stats.map((s) => ({
      name: s.stat.name,
      value: s.base_stat,
    })),
  };
}
