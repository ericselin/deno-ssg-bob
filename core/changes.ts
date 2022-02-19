import { path } from "../deps.ts";
import type { Change } from "../domain.ts";

/** Filter duplicates (inefficient algo, but we generally only have a few items in the array) */
export const removeDuplicateChanges = (
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
