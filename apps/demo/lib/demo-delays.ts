export const DEMO_DELAYS = {
  pokemon: { label: "Pokemon", default: 800 },
  species: { label: "Species", default: 1000 },
  typeDefense: { label: "Type Defense", default: 0 },
  evolution: { label: "Evolution", default: 0 },
  encounters: { label: "Encounters", default: 0 },
} as const;

export type DelayKey = keyof typeof DEMO_DELAYS;

export function getDelays(cookieValue?: string): Record<DelayKey, number> {
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
