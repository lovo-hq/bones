import { forceBones } from "bones";
import { ArticlePreview } from "@/components/article-preview/article-preview";
import { DemoSection } from "@/components/demo-section/demo-section";
import styles from "./styles.module.css";

export function MultiLineTextDemo() {
  return (
    <DemoSection
      title="Multi-Line Text"
      description={
        <>
          Pass <code>{"{ lines: N }"}</code> to <code>bone("text")</code> to create paragraph-sized
          placeholders. The skeleton automatically generates one bar per line using a CSS repeating
          gradient — no extra DOM elements.
        </>
      }
    >
      <div className={styles.articleDemos}>
        <ArticlePreview article={forceBones} />
        <ArticlePreview
          article={{
            title: "Understanding React Server Components",
            excerpt:
              "Server Components let you render components on the server, reducing the JavaScript sent to the client. This changes how we think about data fetching and component architecture.",
            author: "Dan Abramov",
            date: "Mar 2026",
          }}
        />
      </div>
    </DemoSection>
  );
}
