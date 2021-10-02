import type { ContentBase, Html } from "./lib/api.ts";
import { readDirectory, Filepath, ContentFile } from "./lib/fs.ts";

export type RawFile = string;
export type RawFrontmatter = string;
export type RawContent = string;

export type FrontmatterParser<T> = (
  frontmatter: RawFrontmatter,
) => T;
export type ContentParser = (content: RawContent) => Html;

export const listDirectories = async (
  directories: string[],
): Promise<Filepath[]> => {
  const files = await Promise.resolve(directories)
    .then((dirs) => Promise.all(dirs.map(readDirectory)))
    .then((arrays) => arrays.flat());
  return files;
};

export const parseContentFile = <T extends ContentBase<unknown, unknown>>(
  parseFrontmatter: FrontmatterParser<T>,
  parseContent: ContentParser,
) =>
  (contentFile: ContentFile): T => {
    const contentSplit = contentFile.content.split("\n---\n");
    const rawContent = contentSplit.pop() || "";
    const rawFrontmatter = contentSplit.pop() || "";
    const frontmatter = parseFrontmatter(rawFrontmatter);
    return {
      filename: contentFile.filepath,
      type: frontmatter?.type,
      frontmatter,
      content: parseContent(rawContent),
    } as T;
  };

