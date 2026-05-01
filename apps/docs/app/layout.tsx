import { RootProvider } from "fumadocs-ui/provider/next";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "@/lib/source";
import { Logo } from "@/components/logo";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
  title: {
    template: "%s | bones",
    default: "Bones: Skeleton loaders designed for React Server Components and streaming.",
  },
  description: "Primitives for inline skeleton loaders in React. One component, both states.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider>
          <DocsLayout
            tree={source.getPageTree()}
            nav={{
              title: (
                <>
                  <Logo height={20} />
                  <span className="sr-only">bones</span>
                </>
              ),
            }}
          >
            {children}
          </DocsLayout>
        </RootProvider>
      </body>
    </html>
  );
}
