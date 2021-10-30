import type { ContentUnknown, Html, Parser } from "../domain.ts";
import { md, yaml } from "../deps.ts";

type RawFrontmatter = string;
type RawContent = string;

type FrontmatterParser = (
  frontmatter: RawFrontmatter,
) => unknown;
type ContentParser = (content: RawContent) => Html;

const markdownParser = (str: string): string => md.parse(str).content;

export const parseContentFile = (
  parseContent: ContentParser,
  parseFrontmatter: FrontmatterParser,
): Parser =>
  (contentFile) => {
    const contentSplit = contentFile.content.split("\n---\n");
    const rawContent = contentSplit.pop() || "";
    const rawFrontmatter = contentSplit.pop() || "";
    const frontmatter = parseFrontmatter(rawFrontmatter) as
      | Record<string, unknown>
      | undefined;

    const content = {
      filepath: contentFile.filepath,
      frontmatter: frontmatter || {},
      content: parseContent(rawContent),
    } as ContentUnknown;

    if (frontmatter?.title) content.title = frontmatter.title as string;

    return content;
  };

export default parseContentFile(markdownParser, yaml.parse);
