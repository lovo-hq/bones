import type { PokemonMoveEntry, MoveDetail, EncounterLocation } from "@/lib/pokeapi";
import { DetailTabs } from "@/components/detail-tabs/detail-tabs";
import { MovesPanel } from "@/components/moves-panel/moves-panel";
import { DexEntriesPanel } from "@/components/dex-entries-panel/dex-entries-panel";
import { LocationsPanel } from "@/components/locations-panel/locations-panel";

interface TabsSectionProps {
  moves: PokemonMoveEntry[];
  moveDetails: Record<string, MoveDetail>;
  flavorTextEntries: { text: string; version: string }[];
  encounters: EncounterLocation[];
}

export function TabsSection({ moves, moveDetails, flavorTextEntries, encounters }: TabsSectionProps) {
  return (
    <DetailTabs
      tabs={[
        {
          id: "moves",
          label: "Moves",
          content: <MovesPanel moves={moves} moveDetails={moveDetails} />,
        },
        {
          id: "dex-entries",
          label: "Dex Entries",
          content: <DexEntriesPanel entries={flavorTextEntries} />,
        },
        {
          id: "locations",
          label: "Locations",
          content: <LocationsPanel locations={encounters} />,
        },
      ]}
    />
  );
}
