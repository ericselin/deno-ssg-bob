import { path, walk } from "../deps.ts";
import type { FilePath, FileReader, FileWriter } from "../domain.ts";

export type DirectoryPath = string;

export const getPublicPathCreator = (publicPath: string) =>
  (filepath: string): string => {
    const dirPathSegments = filepath.split("/").slice(0, -1);
    const parsedPath = path.parse(filepath);
    if (parsedPath.name === "index") dirPathSegments.push("index.html");
    else dirPathSegments.push(`${parsedPath.name}/index.html`);
    return path.join(publicPath, ...dirPathSegments);
  };

export const readContentFile: FileReader = () =>
  async (
    filepath,
  ) => {
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
): Promise<FilePath[]> => {
  const files: FilePath[] = [];
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

export const writeContentFile: FileWriter = () =>
  async (
    outputFile,
  ) => {
    await Deno.mkdir(path.dirname(outputFile.path), { recursive: true });
    await Deno.writeTextFile(outputFile.path, outputFile.output);
  };
