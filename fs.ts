import { path } from "./deps.ts";

export type DirectoryPath = string;
export type Filepath = string;

export type RawFile = string;
export type RawFrontmatter = string;
export type RawContent = string;

export type ContentFile = {
  filepath: Filepath;
  content: RawFile;
};

export type OutputFile = {
  filepath: Filepath;
  output: RawFile;
};

const readDirectoryRecursive = async (
  rootDirectory: string,
  directory: string = "",
): Promise<ContentFile[]> => {
  const files: ContentFile[] = [];
  const fullDirectoryPath = path.join(rootDirectory, directory);
  for await (const dirEntry of Deno.readDir(fullDirectoryPath)) {
    const relativeEntryPath = path.join(directory, dirEntry.name);
    if (dirEntry.isFile) {
      const content = await Deno.readTextFile(
        path.join(fullDirectoryPath, dirEntry.name),
      );
      files.push(
        {
          filepath: relativeEntryPath,
          content,
        },
      );
    } else if (dirEntry.isDirectory) {
      const subdirFilepaths = await readDirectoryRecursive(
        rootDirectory,
        relativeEntryPath,
      );
      files.push(...subdirFilepaths);
    }
  }
  return files;
};

export const readDirectory = async (
  directory: string,
): Promise<ContentFile[]> => {
  return readDirectoryRecursive(directory);
};

export const writeContentFile = async (
  contentFile: OutputFile,
): Promise<void> => {
  await Deno.mkdir(path.dirname(contentFile.filepath), { recursive: true });
  await Deno.writeTextFile(contentFile.filepath, contentFile.output);
};
