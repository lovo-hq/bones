export const DEMO_DELAYS = {
  pokemon: { label: "Pokemon", default: 800 },
  species: { label: "Species", default: 1000 },
  typeDefense: { label: "Type Defense", default: 1200 },
  evolution: { label: "Evolution", default: 1400 },
  encounters: { label: "Encounters", default: 600 },
  training: { label: "Training", default: 1100 },
  breeding: { label: "Breeding", default: 1300 },
  pokedex: { label: "Pokedex Data", default: 1500 },
  moves: { label: "Moves", default: 1800 },
} as const;

export type DelayKey = keyof typeof DEMO_DELAYS;

export function getDelays(cookieValue?: string, isCompare?: boolean): Record<DelayKey, number> {
  if (isCompare) {
    return Object.fromEntries(
      Object.keys(DEMO_DELAYS).map((k) => [k, Infinity]),
    ) as Record<DelayKey, number>;
  }
  const defaults = Object.fromEntries(
    Object.entries(DEMO_DELAYS).map(([k, v]) => [k, v.default]),
  ) as Record<DelayKey, number>;
  if (!cookieValue) return defaults;
  try {
    return { ...defaults, ...JSON.parse(cookieValue) };
  } catch {
    return defaults;
  }
}
