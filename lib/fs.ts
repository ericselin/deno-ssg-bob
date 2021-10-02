import { path, walk } from "../deps.ts";

export type DirectoryPath = string;
export type Filepath = {
  contentDir: string;
  relativePath: string;
  outputPath: string;
};

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

export const transformFilename = (filepath: string): string => {
  const dirPathSegments = filepath.split("/").slice(0, -1);
  const parsedPath = path.parse(filepath);
  if (parsedPath.name === "index") dirPathSegments.push("index.html");
  else dirPathSegments.push(`${parsedPath.name}/index.html`);
  return path.join("public", ...dirPathSegments);
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
  directory: string,
): Promise<Filepath[]> => {
  const files: Filepath[] = [];
  for await (const dirEntry of walk(directory)) {
    if (dirEntry.isFile) {
      const relativeEntryPath = path.relative(directory, dirEntry.path);
      files.push({
        contentDir: directory,
        relativePath: relativeEntryPath,
        outputPath: transformFilename(relativeEntryPath),
      });
    }
  }
  return files;
};

export const listDirectories = async (
  directories: string[],
): Promise<Filepath[]> => {
  const files = await Promise.resolve(directories)
    .then((dirs) => Promise.all(dirs.map(listDirectory)))
    .then((arrays) => arrays.flat());
  return files;
};

export const writeContentFile = async (
  contentFile: OutputFile,
): Promise<void> => {
  await Deno.mkdir(path.dirname(contentFile.filepath), { recursive: true });
  await Deno.writeTextFile(contentFile.filepath, contentFile.output);
};
