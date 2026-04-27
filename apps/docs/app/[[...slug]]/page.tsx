import { source } from "@/lib/source";
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from "fumadocs-ui/layouts/docs/page";
import { notFound } from "next/navigation";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { Mermaid } from "fumadocs-mermaid/ui";

interface Props {
  params: Promise<{ slug?: string[] }>;
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const page = source.getPage(slug);

  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={{ ...defaultMdxComponents, Mermaid }} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const page = source.getPage(slug);

  if (!page) return {};

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

export function generateStaticParams() {
  return source.generateParams("slug");
}
