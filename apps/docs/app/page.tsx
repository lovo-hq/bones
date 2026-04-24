import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center text-center">
      <h1 className="mb-4 text-4xl font-bold">Bones</h1>
      <p className="mb-8 text-lg text-fd-muted-foreground">
        Skeleton loaders that use your real components.
      </p>
      <Link
        href="/docs"
        className="rounded-md bg-fd-primary px-6 py-3 text-sm font-medium text-fd-primary-foreground transition-colors hover:bg-fd-primary/90"
      >
        Get Started
      </Link>
    </main>
  );
}
