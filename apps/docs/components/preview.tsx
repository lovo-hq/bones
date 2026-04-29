import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import { PreviewToggle } from "./preview-toggle";
import type { ReactNode } from "react";

interface PreviewProps {
  code: string;
  lang?: string;
  title?: string;
  children: ReactNode;
}

export async function Preview({
  code,
  lang = "tsx",
  title,
  children,
}: PreviewProps) {
  const { highlight } = await import("fumadocs-core/highlight");
  const highlighted = await highlight(code, { lang });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        alignItems: "start",
      }}
      className="preview-grid"
    >
      <CodeBlock title={title}>
        <Pre>{highlighted}</Pre>
      </CodeBlock>
      <div
        style={{
          padding: 24,
          borderRadius: 12,
          border: "1px solid var(--fd-color-border)",
          background: "var(--fd-color-card)",
        }}
      >
        <PreviewToggle>{children}</PreviewToggle>
      </div>
    </div>
  );
}
