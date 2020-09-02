import type { ContentBase, Html } from "./api.ts";
import { readDirectory, ContentFile, OutputFile } from "./fs.ts";
import { path } from "./deps.ts";

export type RawFile = string;
export type RawFrontmatter = string;
export type RawContent = string;

export type FrontmatterParser<T> = (
  frontmatter: RawFrontmatter,
) => T;
export type ContentParser = (content: RawContent) => Html;

export const readContentFiles = async (
  directories: string[],
): Promise<ContentFile[]> => {
  const files = await Promise.resolve(directories)
    .then((dirs) => Promise.all(dirs.map(readDirectory)))
    .then((arrays) => arrays.flat());
  return files;
};

export const parseContentFile = <T extends ContentBase<any, any>>(
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

export const transformFilename = (file: OutputFile): OutputFile => {
  const dirPathSegments = file.filepath.split("/").slice(0, -1);
  const parsedPath = path.parse(file.filepath);
  if (parsedPath.name === "index") dirPathSegments.push("index.html");
  else dirPathSegments.push(`${parsedPath.name}/index.html`);
  return {
    filepath: dirPathSegments.join("/"),
    output: file.output,
  };
};
