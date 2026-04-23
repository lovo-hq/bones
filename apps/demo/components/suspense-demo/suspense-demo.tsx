import { Bones } from "bones";
import type { PokemonListItem } from "@/lib/pokeapi";
import { delay } from "@/lib/delay";
import { DemoSection } from "@/components/demo-section/demo-section";
import { PokemonGrid } from "@/components/pokemon-grid/pokemon-grid";

export function SuspenseDemo({ pokemon }: { pokemon: PokemonListItem[] }) {
  return (
    <DemoSection
      title="Streaming with Suspense"
      description={
        <>
          Pass a promise to <code>PokemonGrid</code> inside a <code>{"<Bones>"}</code> boundary.
          The <strong>same component</strong> renders as skeletons in the fallback, then swaps to
          content when data resolves.
        </>
      }
      hint="Refresh the page to see the skeleton → content transition."
    >
      <Bones>
        <PokemonGrid pokemon={delay(Promise.resolve(pokemon), 2000)} />
      </Bones>
    </DemoSection>
  );
}
