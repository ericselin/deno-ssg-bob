import { path } from "../deps.ts";
import type { FileReader, FileWriter } from "../domain.ts";

export type DirectoryPath = string;

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

export const writeContentFile: FileWriter = ({ log }) =>
  async (
    outputFile,
  ) => {
    await Deno.mkdir(path.dirname(outputFile.path), { recursive: true });
    await Deno.writeTextFile(outputFile.path, outputFile.output);
    log?.info(`Wrote file ${outputFile.path} to disk`);
  };
