import { createBones } from "bones";

interface Article {
  title: string;
  excerpt: string;
  author: string;
  date: string;
}

export function ArticlePreview({ article }: { article?: Article }) {
  const { bone } = createBones(article);

  return (
    <div className="article-preview">
      <h3 className="article-title" {...bone("text", { length: 24 })}>
        {article?.title}
      </h3>
      <p className="article-excerpt" {...bone("text", { lines: 4 })}>
        {article?.excerpt}
      </p>
      <div className="article-meta">
        <span {...bone("text", { length: 12 })}>{article?.author}</span>
        <span className="article-dot">&middot;</span>
        <span {...bone("text", { length: 10 })}>{article?.date}</span>
      </div>
    </div>
  );
}
