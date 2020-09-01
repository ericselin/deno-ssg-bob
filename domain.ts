import type { ContentBase, Filepath, Html } from "./api.ts";

export type RawFile = string;
export type RawFrontmatter = string;
export type RawContent = string;

type ContentFile = {
  filepath: Filepath;
  content: RawFile;
};

export type OutputFile = {
  filepath: Filepath;
  content: RawFile;
};

export type FrontmatterParser<T> = (
  frontmatter: RawFrontmatter,
) => T;
export type ContentParser = (content: RawContent) => Html;

const readDirectoryRecursive = async (
  rootDirectory: string,
  directory?: string,
): Promise<ContentFile[]> => {
  const files: ContentFile[] = [];
  const fullDirectoryPath = rootDirectory + (directory ? `/${directory}` : "");
  for await (const dirEntry of Deno.readDir(fullDirectoryPath)) {
    const entryPath = (directory ? `${directory}/` : "") + dirEntry.name;
    if (dirEntry.isFile) {
      files.push(
        {
          filepath: `${entryPath}`,
          content: await Deno.readTextFile(
            `${fullDirectoryPath}/${dirEntry.name}`,
          ),
        },
      );
    } else if (dirEntry.isDirectory) {
      const subdirFilepaths = await readDirectoryRecursive(
        rootDirectory,
        entryPath,
      );
      files.push(...subdirFilepaths);
    }
  }
  return files;
};

const readDirectory = async (directory: string): Promise<ContentFile[]> => {
  return readDirectoryRecursive(directory);
};

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
    return {
      filename: contentFile.filepath,
      frontmatter: parseFrontmatter(rawFrontmatter),
      content: parseContent(rawContent),
    } as T;
  };

export const transformFilename = (file: OutputFile): OutputFile => {
  const pathSegments = file.filepath.split("/");
  const [filename] = pathSegments.pop()?.split(".") || [];
  if (filename === "index") pathSegments.push("index.html");
  else pathSegments.push(`${filename}/index.html`);
  return {
    content: file.content,
    filepath: pathSegments.join("/"),
  };
};

export const dirname = (path: string) => {
  const arr = path.split("/");
  arr.pop();
  return arr.join("/");
};

export const writeContentFile = async (
  contentFile: OutputFile,
): Promise<void> => {
    await Deno.mkdir(dirname(contentFile.filepath), { recursive: true });
    await Deno.writeTextFile(contentFile.filepath, contentFile.content);
};
