import type {
  BuildOptions,
  DirtyChecker,
  FilePath,
  FileWalkerCreator,
  FilePathGenerator,
} from "../domain.ts";
import { walk } from "../deps.ts";
import getWalkEntryProcessor from "./walk-entry-processor.ts";

async function* walkFiles(
  options: BuildOptions,
  path: string,
): AsyncGenerator<FilePath> {
  const processWalkEntry = getWalkEntryProcessor(options);
  for await (const walkEntry of walk(path)) {
    if (walkEntry.isFile) yield processWalkEntry(walkEntry);
  }
}

async function* yieldDirtyFilePaths(walk: FilePathGenerator) {
  for await (const filepath of walk) {
    if (filepath.dirty) yield filepath;
  }
}

const createDirtyFileWalker: FileWalkerCreator = (dirtyCheckerCreators) =>
  (options) => {
    const dirtyCheckers = dirtyCheckerCreators.map((dirtyChekerCreator) =>
      dirtyChekerCreator(options)
    );
    async function* markDirty(walk: FilePathGenerator, isDirty?: DirtyChecker) {
      for await (const filepath of walk) {
        if (filepath.dirty) yield filepath;
        else if (isDirty && await isDirty(filepath)) {
          filepath.dirty = true;
          options.log?.debug(`Marking ${filepath.relativePath} dirty`);
        }
        yield filepath;
      }
    }
    return (dirpath) => {
      const dirtyCheckedWalker = dirtyCheckers.reduce(
        (walk, isDirty) => markDirty(walk, isDirty),
        markDirty(walkFiles(options, dirpath)),
      );
      return yieldDirtyFilePaths(dirtyCheckedWalker);
    };
  };

export default createDirtyFileWalker;
