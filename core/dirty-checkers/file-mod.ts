import { exists } from "../../deps.ts";
import type { DirtyCheckerCreator } from "../../domain.ts";

const getModificationTime = async (filepath: string): Promise<Date | null> => {
  if (!await exists(filepath)) return null;
  const contentFile = await Deno.stat(filepath);
  return contentFile.mtime;
};

const dirtyFileMod: DirtyCheckerCreator = () =>
  async (location) => {
    // get modification time of content file
    const contentModTime = await getModificationTime(
      location.inputPath
    );
    if (!contentModTime) {
      throw new Error(
        `Content file ${location.inputPath} not found`,
      );
    }
    // get modification time of rendered file
    const outputModTime = await getModificationTime(location.outputPath);
    // if no output file mod time (does not exist), this is dirty
    if (!outputModTime) return true;
    // if content modified after render, this is dirty
    return contentModTime > outputModTime;
  };

export default dirtyFileMod;
