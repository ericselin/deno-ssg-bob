import type { BuildOptions, Change, ChangeType } from "../domain.ts";
import dirtyFileMod from "./dirty-checkers/file-mod.ts";
import dirtyLayoutsChanged from "./dirty-checkers/layouts.ts";
import allDirtyOnForce from "./dirty-checkers/force-build.ts";
import createDirtyFileWalker from "./dirty-file-walk.ts";
import { path, walk } from "../deps.ts";

/** Get input paths which might have resulted in a specific public (output) path */
export const _createInputPathsGetter = (
  { contentDir, publicDir }: DeletedContentFilesOptions,
) =>
  (publicPath: string): string[] => {
    const relativePath = path.relative(publicDir, publicPath);
    const paths = [path.join(contentDir, relativePath)];
    if (path.extname(relativePath) === ".html") {
      const relativeDir = path.dirname(relativePath);
      paths.push(path.join(contentDir, `${relativeDir}.md`));
      paths.push(path.join(contentDir, relativeDir, "index.md"));
    }
    return paths;
  };

type DeletedContentFilesOptions = { contentDir: string; publicDir: string };

/** Check if the specified public file path has a corresponding content file. */
const createDeletedContentFilesGetter = (
  options: DeletedContentFilesOptions,
) => {
  const getPossibleInputPaths = _createInputPathsGetter(options);
  return async (publicPath: string): Promise<string[] | undefined> => {
    const inputPathPossibilities = getPossibleInputPaths(publicPath);
    try {
      await Promise.any(
        inputPathPossibilities.map(async (inputPath) => {
          await Deno.lstat(inputPath);
        }),
      );
      return undefined;
    } catch {
      return inputPathPossibilities;
    }
  };
};

/**
 * From files in public folder that have no corresponding content file,
 * get all possible content files that might have been deleted.
 * @returns Array of content file paths, relative to cwd
 */
const getDeletedContentFiles = async (
  options: DeletedContentFilesOptions,
): Promise<string[]> => {
  const getDeletionPossibilities = createDeletedContentFilesGetter(options);
  const contentFiles: string[] = [];
  for await (const publicWalkEntry of walk(options.publicDir)) {
    // just bail if this is not a file
    if (!publicWalkEntry.isFile) continue;

    const publicPath = publicWalkEntry.path;
    const deletedContentFiles = await getDeletionPossibilities(publicPath);
    if (deletedContentFiles) contentFiles.push(...deletedContentFiles);
  }
  return contentFiles;
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
    (path) => ({ type: "delete", inputPath: path }),
  );
  changes.push(...orphanedPublicFilesChanges);

  log?.debug(`Got changes in ${Date.now() - startTime} ms`);

  return changes;
};
