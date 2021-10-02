import { ContentBase, ContentRenderer } from "../../mod.ts";

type Content = ContentBase<{ title: string } | undefined, undefined>;

const base: ContentRenderer<Content> = (content) => `${content.frontmatter?.title}

${content.content}`;

export default base;
