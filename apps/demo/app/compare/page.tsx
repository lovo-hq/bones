import { BonesForce } from "bones";
import { HeroSection } from "@/components/hero-section/hero-section";
import { SuspenseDemo } from "@/components/suspense-demo/suspense-demo";
import { ForcedSkeletonsDemo } from "@/components/forced-skeletons-demo/forced-skeletons-demo";
import { MultiLineTextDemo } from "@/components/multi-line-text-demo/multi-line-text-demo";
import { AnimationsDemo } from "@/components/animations-demo/animations-demo";
import { ThemingDemo } from "@/components/theming-demo/theming-demo";

/**
 * Skeleton-only mirror of the home page.
 * Used by the Compare Bones devtool overlay.
 */
export default function CompareHomePage() {
  return (
    <BonesForce>
      <main>
        <HeroSection />
        <SuspenseDemo />
        <ForcedSkeletonsDemo />
        <MultiLineTextDemo />
        <AnimationsDemo />
        <ThemingDemo />
      </main>
    </BonesForce>
  );
}
