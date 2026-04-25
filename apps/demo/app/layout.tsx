import type { Metadata } from "next";
import { cookies } from "next/headers";
import { BonesForce } from "bones";
import { BonesDevTool } from "@/components/bones-devtool/bones-devtool";
import "bones/css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bones Demo — Pokédex",
  description: "Demonstrating inline skeleton loaders with Bones and the PokeAPI",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const forceSkeletons = cookieStore.get("bones-force")?.value === "1";
  const animate = cookieStore.get("bones-animate")?.value ?? "shimmer";

  return (
    <html lang="en">
      <body data-bone-animate={animate}>
        {forceSkeletons ? <BonesForce>{children}</BonesForce> : children}
        <BonesDevTool />
      </body>
    </html>
  );
}
