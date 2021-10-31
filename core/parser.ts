import type { BuildOptions, Page, Html, Parser } from "../domain.ts";
import { md, yaml } from "../deps.ts";

type RawFrontmatter = string;
type RawContent = string;

type FrontmatterParser = (
  frontmatter: RawFrontmatter,
) => unknown;
type ContentParser = (content: RawContent) => Html;

const markdownParser = (str: string): string => md.parse(str).content;

export const getContentFileParser = (
  parseContent: ContentParser,
  parseFrontmatter: FrontmatterParser,
) =>
  ({ log }: BuildOptions): Parser =>
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
        get summary() {
          // here we're assuming `content` is HTML
          let summary = this.content
            // get first 500 characters
            .substr(0, 500)
            // strip html tags
            .replace(/<[^>]*>?/g, "")
            // replace newlines with space
            .replace(/\n+/g, " ");
          // if we have sentences, remove the last (partial) sentence
          if (summary.includes(".")) {
            summary = summary.split(".").slice(0, -1).join(".").concat(".");
          }
          // return without whitespace
          return summary.trim();
        },
      } as Page;

      if (frontmatter?.title) content.title = frontmatter.title as string;

      if (frontmatter?.date) {
        try {
          content.date = new Date(frontmatter.date as string);
        } catch (e) {
          log?.warning(
            `Could not parse date "${frontmatter.date}" in \`${contentFile.filepath.relativePath}\``,
          );
          log?.debug(e.toString());
        }
      }

      return content;
    };

export default getContentFileParser(markdownParser, yaml.parse);
