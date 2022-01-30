import { path } from "../deps.ts";
import type { Change } from "../domain.ts";

/** Filter duplicates (inefficient algo, but we generally only have a few items in the array) */
export const _removeDuplicateChanges = (
  change: Change,
  index: number,
  changes: Change[],
): boolean =>
  changes.findIndex((c) => (
    (c.type === "orphan" && change.type === "orphan" &&
      c.outputPath === change.outputPath) ||
    (c.type !== "orphan" && c.type === change.type &&
      c.inputPath === change.inputPath)
  )) === index;

/** Filter modifications for deleted and created files */
export const _removeModifiedWhenAlsoCreatedOrDeleted = (
  change: Change,
  _index: number,
  changes: Change[],
): boolean =>
  change.type !== "modify" ||
  changes.findIndex(
      (c) => (
        (c.type === "delete" || c.type === "create") &&
        c.inputPath === change.inputPath
      ),
    ) < 0;

/** Filter for `Change[]` that removes unnecessary changes */
export const sanitizeChangesFilter = (
  change: Change,
  index: number,
  changes: Change[],
): boolean =>
  _removeDuplicateChanges(change, index, changes) &&
  _removeModifiedWhenAlsoCreatedOrDeleted(change, index, changes);

/** Get input paths which might have resulted in a specific public (output) path */
export const createInputPathsGetter = (
  { contentDir, publicDir }: { contentDir: string; publicDir: string },
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
