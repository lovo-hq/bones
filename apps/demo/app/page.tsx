import { HeroSection } from "@/components/hero-section/hero-section";
import { SuspenseDemo } from "@/components/suspense-demo/suspense-demo";
import { ForcedSkeletonsDemo } from "@/components/forced-skeletons-demo/forced-skeletons-demo";
import { MultiLineTextDemo } from "@/components/multi-line-text-demo/multi-line-text-demo";
import { AnimationsDemo } from "@/components/animations-demo/animations-demo";
import { ThemingDemo } from "@/components/theming-demo/theming-demo";

export default async function Home() {
  return (
    <main>
      <HeroSection />
      <SuspenseDemo />
      <ForcedSkeletonsDemo />
      <MultiLineTextDemo />
      <AnimationsDemo />
      <ThemingDemo />
    </main>
  );
}
