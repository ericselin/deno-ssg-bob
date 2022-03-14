import type { BuildOptions, Change, ChangeType } from "../domain.ts";
import dirtyFileMod from "./dirty-checkers/file-mod.ts";
import dirtyLayoutsChanged from "./dirty-checkers/layouts.ts";
import allDirtyOnForce from "./dirty-checkers/force-build.ts";
import createDirtyFileWalker from "./dirty-file-walk.ts";
import { path, walk } from "../deps.ts";
import { createInputPathsGetter } from "./changes.ts";

/** Content and public dirs should be absolute */
type DeletedContentFilesOptions = { contentDir: string; publicDir: string };

/** Check if the specified public file path has a corresponding content file. */
export const _createDeletedContentFilesChecker = (
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
 * Get files in public folder that have no corresponding content file
 * @returns Array of orphaned public file paths, relative to cwd
 */
export const _getDeletedContentFiles = async (
  options: DeletedContentFilesOptions,
): Promise<string[]> => {
  const checkIfAllContentFilesDeleted = _createDeletedContentFilesChecker(
    options,
  );
  const orphanedPublicFiles: string[] = [];
  let walkIterable;
  try {
    walkIterable = walk(options.publicDir, { includeDirs: false });
  } catch (e) {
    if (e.name === "NotFound") {
      return [];
    }
    throw e;
  }
  for await (const publicWalkEntry of walkIterable) {
    const publicPath = publicWalkEntry.path;
    if (await checkIfAllContentFilesDeleted(publicPath)) {
      orphanedPublicFiles.push(publicPath);
    }
  }
  // return relative to cwd
  return orphanedPublicFiles.map((filepath) =>
    path.relative(Deno.cwd(), filepath)
  );
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

  // options for deleted content files getter
  const opts: DeletedContentFilesOptions = {
    publicDir: options.publicDir,
    contentDir: options.contentDir,
  };
  if (!path.isAbsolute(opts.publicDir)) {
    opts.publicDir = path.join(Deno.cwd(), opts.publicDir);
  }
  if (!path.isAbsolute(opts.contentDir)) {
    opts.contentDir = path.join(Deno.cwd(), opts.contentDir);
  }

  // get public files that need to be deleted
  const orphanedPublicFiles: string[] = await _getDeletedContentFiles(opts);
  const orphanedPublicFilesChanges: Change[] = orphanedPublicFiles.map(
    (path) => ({ type: "orphan", outputPath: path }),
  );
  changes.push(...orphanedPublicFilesChanges);

  log?.debug(`Got changes in ${Date.now() - startTime} ms`);

  return changes;
};
