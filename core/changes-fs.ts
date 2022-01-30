import type { BuildOptions, Change, ChangeType } from "../domain.ts";
import dirtyFileMod from "./dirty-checkers/file-mod.ts";
import dirtyLayoutsChanged from "./dirty-checkers/layouts.ts";
import allDirtyOnForce from "./dirty-checkers/force-build.ts";
import createDirtyFileWalker from "./dirty-file-walk.ts";
import { walk } from "../deps.ts";
import { createInputPathsGetter } from "./changes.ts";

type DeletedContentFilesOptions = { contentDir: string; publicDir: string };

/** Check if the specified public file path has a corresponding content file. */
const createDeletedContentFilesChecker = (
  options: DeletedContentFilesOptions,
) => {
  const getPossibleInputPaths = createInputPathsGetter(options);
  return async (publicPath: string): Promise<boolean> => {
    const inputPathPossibilities = getPossibleInputPaths(publicPath);
    try {
      // any will resolve if any of the promises resolve,
      // and throw only if all promises reject
      // in essence, it throws if none of the files found
      await Promise.any(
        inputPathPossibilities.map(async (inputPath) => {
          // this will throw if file not found
          await Deno.lstat(inputPath);
        }),
      );
      return false;
    } catch {
      // all content files deleted if all promises rejected
      return true;
    }
  };
};

/**
 * From files in public folder that have no corresponding content file
 * @returns Array of orphaned public file paths, relative to cwd
 */
const getDeletedContentFiles = async (
  options: DeletedContentFilesOptions,
): Promise<string[]> => {
  const checkIfAllContentFilesDeleted = createDeletedContentFilesChecker(
    options,
  );
  const orphanedPublicFiles: string[] = [];
  for await (const publicWalkEntry of walk(options.publicDir)) {
    // just bail if this is not a file
    if (!publicWalkEntry.isFile) continue;

    const publicPath = publicWalkEntry.path;
    if (await checkIfAllContentFilesDeleted(publicPath)) {
      orphanedPublicFiles.push(publicPath);
    }
  }
  return orphanedPublicFiles;
};

export const getFilesystemChanges = async (
  options: BuildOptions,
): Promise<Change[]> => {
  const { log } = options;

  const walkDirty = createDirtyFileWalker([
    allDirtyOnForce,
    dirtyLayoutsChanged,
    dirtyFileMod,
  ])(
    options,
  );

  const changes: Change[] = [];

  log?.debug("Getting file system -based changes...");
  const startTime = Date.now();

  // get content files that need updating
  for await (const location of walkDirty()) {
    // see if it's a modification or a new file
    let type: ChangeType = "modify";
    try {
      // this will throw if not found
      await Deno.lstat(location.outputPath);
    } catch (_e) {
      type = "create";
    }
    changes.push({ type, inputPath: location.inputPath });
  }
  // get public files that need to be deleted
  const orphanedPublicFiles: string[] = await getDeletedContentFiles(options);
  const orphanedPublicFilesChanges: Change[] = orphanedPublicFiles.map(
    (path) => ({ type: "orphan", outputPath: path }),
  );
  changes.push(...orphanedPublicFilesChanges);

  log?.debug(`Got changes in ${Date.now() - startTime} ms`);

  return changes;
};
