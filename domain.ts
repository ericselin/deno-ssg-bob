import type { ContentBase, Filename, Html } from "./api.ts";

export type RawFile = string;
export type RawFrontmatter = string;
export type RawContent = string;

type ContentFile = {
  filename: Filename;
  content: RawFile;
};

export type OutputFile = {
  filename: Filename;
  content: RawFile;
};

export type FrontmatterParser<T> = (
  frontmatter: RawFrontmatter,
) => T;
export type ContentParser = (content: RawContent) => Html;

const readDirectoryFilepathsRecursive = async (
  directory: string,
): Promise<string[]> => {
  const files: string[] = [];
  for await (const dirEntry of Deno.readDir(directory)) {
    const entryPath = `${directory}/${dirEntry.name}`;
    if (dirEntry.isFile) files.push(entryPath);
    else if (dirEntry.isDirectory) {
      const subdirFilepaths = await readDirectoryFilepathsRecursive(entryPath);
      files.push(...subdirFilepaths);
    }
  }
  return files;
};

const toContentFile = async (filepath: string): Promise<ContentFile> => ({
  filename: filepath,
  content: new TextDecoder().decode(await Deno.readFile(filepath)).toString(),
});

export const readContentFiles = async (
  directories: string[],
): Promise<ContentFile[]> => {
  const files = await Promise.resolve(directories)
    .then((dirs) => Promise.all(dirs.map(readDirectoryFilepathsRecursive)))
    .then((arrays) => arrays.flat())
    .then((filepaths) => Promise.all(filepaths.map(toContentFile)));
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
    return {
      filename: contentFile.filename,
      frontmatter: parseFrontmatter(rawFrontmatter),
      content: parseContent(rawContent),
    } as T;
  };

export const writeContentFile = async (
  contentFile: OutputFile,
): Promise<void> => {
  console.log(contentFile);
};
