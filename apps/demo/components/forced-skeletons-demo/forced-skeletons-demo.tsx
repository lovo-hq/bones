import type { PokemonListItem } from "@/lib/pokeapi";
import { DemoSection } from "@/components/demo-section/demo-section";
import { PokemonGrid } from "@/components/pokemon-grid/pokemon-grid";
import { SkeletonToggle } from "@/components/skeleton-toggle/skeleton-toggle";

export function ForcedSkeletonsDemo({ pokemon }: { pokemon: PokemonListItem[] }) {
  return (
    <DemoSection
      title="Forced Skeletons"
      description="Omit data to force skeleton mode. Toggle to see the same loaded cards switch to skeletons — no provider needed."
    >
      <SkeletonToggle skeleton={<PokemonGrid />}>
        <PokemonGrid pokemon={pokemon} />
      </SkeletonToggle>
    </DemoSection>
  );
}
