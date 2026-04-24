import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Bones",
    default: "Bones — Skeleton Loaders for React",
  },
  description:
    "Primitives for inline skeleton loaders in React. Same component, both states.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
