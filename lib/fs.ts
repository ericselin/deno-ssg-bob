import { path, walk } from "../deps.ts";
import type { Filepath } from "../domain.ts";

export type DirectoryPath = string;

export type RawFile = string;
export type RawFrontmatter = string;
export type RawContent = string;

export type ContentFile = {
  filepath: Filepath;
  content: RawFile;
};

export type OutputFile = {
  filepath: string;
  output: RawFile;
};

export const getPublicPathCreator = (publicPath: string) => (filepath: string): string => {
  const dirPathSegments = filepath.split("/").slice(0, -1);
  const parsedPath = path.parse(filepath);
  if (parsedPath.name === "index") dirPathSegments.push("index.html");
  else dirPathSegments.push(`${parsedPath.name}/index.html`);
  return path.join(publicPath, ...dirPathSegments);
};

export const readContentFile = async (
  filepath: Filepath,
): Promise<ContentFile> => {
  const content = await Deno.readTextFile(
    path.join(filepath.contentDir, filepath.relativePath),
  );
  return {
    filepath,
    content,
  };
};

export const listDirectory = async (
  contentDir: string,
  publicDir: string,
): Promise<Filepath[]> => {
  const files: Filepath[] = [];
  const createPublicPath = getPublicPathCreator(publicDir);
  for await (const dirEntry of walk(contentDir)) {
    if (dirEntry.isFile) {
      const relativeEntryPath = path.relative(contentDir, dirEntry.path);
      files.push({
        contentDir: contentDir,
        relativePath: relativeEntryPath,
        outputPath: createPublicPath(relativeEntryPath),
      });
    }
  }
  return files;
};

export const writeContentFile = async (
  contentFile: OutputFile,
): Promise<void> => {
  await Deno.mkdir(path.dirname(contentFile.filepath), { recursive: true });
  await Deno.writeTextFile(contentFile.filepath, contentFile.output);
};
