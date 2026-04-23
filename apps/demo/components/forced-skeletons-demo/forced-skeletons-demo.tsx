import { BonesForce } from "bones";
import type { PokemonListItem } from "@/lib/pokeapi";
import { DemoSection } from "@/components/demo-section/demo-section";
import { PokemonGrid } from "@/components/pokemon-grid/pokemon-grid";
import { SkeletonToggle } from "@/components/skeleton-toggle/skeleton-toggle";

export function ForcedSkeletonsDemo({ pokemon }: { pokemon: PokemonListItem[] }) {
  return (
    <DemoSection
      title="Forced Skeletons"
      description="Wrap with BonesForce to force skeleton mode. Toggle to see the same loaded cards switch to skeletons — no provider needed."
    >
      <SkeletonToggle
        skeleton={
          <BonesForce>
            <PokemonGrid />
          </BonesForce>
        }
      >
        <PokemonGrid pokemon={pokemon} />
      </SkeletonToggle>
    </DemoSection>
  );
}
