import { path } from "../deps.ts";

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

const listDirectoryRecursive = async (
  rootDirectory: string,
  directory = "",
): Promise<Filepath[]> => {
  const files: Filepath[] = [];
  const fullDirectoryPath = path.join(rootDirectory, directory);
  for await (const dirEntry of Deno.readDir(fullDirectoryPath)) {
    const relativeEntryPath = path.join(directory, dirEntry.name);
    if (dirEntry.isFile) {
      files.push({
        contentDir: rootDirectory,
        relativePath: relativeEntryPath,
        outputPath: transformFilename(relativeEntryPath),
      });
    } else if (dirEntry.isDirectory) {
      const subdirFilepaths = await listDirectoryRecursive(
        rootDirectory,
        relativeEntryPath,
      );
      files.push(...subdirFilepaths);
    }
  }
  return files;
};

export const listDirectory = (
  directory: string,
): Promise<Filepath[]> => {
  return listDirectoryRecursive(directory);
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
