import type {
  BuildOptions,
  DirtyChecker,
  LocationGenerator,
  FileWalkerCreator,
} from "../domain.ts";
import { walk } from "../deps.ts";
import getWalkEntryProcessor from "./walk-entry-processor.ts";

async function* walkFiles(
  options: BuildOptions,
  path: string,
): LocationGenerator {
  const processWalkEntry = getWalkEntryProcessor(options);
  for await (const walkEntry of walk(path)) {
    if (walkEntry.isFile) yield processWalkEntry(walkEntry);
  }
}

async function* yieldDirtyFilePaths(walk: LocationGenerator) {
  for await (const location of walk) {
    if (location.dirty) yield location;
  }
}

const createDirtyFileWalker: FileWalkerCreator = (dirtyCheckerCreators) =>
  (options) => {
    const dirtyCheckers = dirtyCheckerCreators.map((dirtyChekerCreator) =>
      dirtyChekerCreator(options)
    );
    async function* markDirty(walk: LocationGenerator, isDirty?: DirtyChecker) {
      for await (const location of walk) {
        if (location.dirty) {
          yield location;
          continue;
        } else if (isDirty && await isDirty(location)) {
          location.dirty = true;
          options.log?.debug(`Marking ${location.inputPath} dirty`);
        }
        yield location;
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
