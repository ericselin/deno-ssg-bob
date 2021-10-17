import type { DirtyCheckerCreator } from "../../domain.ts";
import { exists, path, walk } from "../../deps.ts";

export const _latestModification = async (
  dir: string,
  extensions?: string[],
): Promise<Date | null> => {
  let latestModTime: Date | null = null;
  for await (const dirEntry of walk(dir)) {
    if (extensions && !extensions.includes(path.extname(dirEntry.name))) {
      continue;
    }
    const stat = await Deno.stat(dirEntry.path);
    if (!latestModTime) latestModTime = stat.mtime;
    else if (stat.mtime && stat.mtime > latestModTime) latestModTime = stat.mtime;
  }
  return latestModTime;
};

export const isOlder = async (
  compareDir: string,
  baseDir: string,
  baseFileExtensions?: string[],
): Promise<boolean> => {
  if (!await exists(compareDir)) return true;
  const baseTime = await _latestModification(
    baseDir,
    baseFileExtensions,
  );
  const compareTime = await _latestModification(compareDir);

  if (!compareTime || !baseTime) return true;
  return compareTime < baseTime;
};

const dirtyLayouts: DirtyCheckerCreator = (
  { layoutDir, publicDir, log },
) => {
  const isPublicOlderP = isOlder(publicDir, layoutDir).then(
    (isOlder) => {
      log?.debug(`Public dir is ${isOlder ? "older" : "newer"} than layouts dir`);
      if (isOlder) log?.warning("Layouts changed, marking everything dirty");
      return isOlder;
    },
  );
  return () => isPublicOlderP;
};

export default dirtyLayouts;
