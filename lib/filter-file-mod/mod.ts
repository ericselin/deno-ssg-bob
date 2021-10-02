import { exists, path } from "../../deps.ts";
import type { Filepath } from "../../domain.ts";

type ShouldRender = (filepath: Filepath) => Promise<boolean>;

const getModificationTime = async (filepath: string): Promise<Date | null> => {
  if (!await exists(filepath)) return null;
  const contentFile = await Deno.stat(filepath);
  return contentFile.mtime;
};

export const shouldRender: ShouldRender = async (filepath) => {
  // get modification time of content file
  const contentModTime = await getModificationTime(
    path.join(filepath.contentDir, filepath.relativePath),
  );
  if (!contentModTime) {
    throw new Error(`Content file ${filepath.relativePath} not found`);
  }
  // get modification time of rendered file
  const outputModTime = await getModificationTime(filepath.outputPath);
  // if no output file mod time (does not exist), return true to render
  if (!outputModTime) return true;
  // if content modified after render, return true
  return contentModTime > outputModTime;
};
