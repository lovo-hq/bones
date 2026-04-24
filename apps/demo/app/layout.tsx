import type { Metadata } from "next";
import "bones/css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bones Demo — Pokédex",
  description: "Demonstrating inline skeleton loaders with Bones and the PokeAPI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body data-bone-animate="shimmer">{children}</body>
    </html>
  );
}
