import { path, walk, exists } from "../../deps.ts";

export const _latestModification = async (
  dir: string,
  extensions?: string[],
): Promise<Date> => {
  let latestModTime: Date = new Date(0);
  for await (const dirEntry of walk(dir)) {
    if (extensions && !extensions.includes(path.extname(dirEntry.name))) {
      continue;
    }
    const stat = await Deno.stat(dirEntry.path);
    if (stat.mtime && stat.mtime > latestModTime) latestModTime = stat.mtime;
  }
  return latestModTime;
};

export const dependenciesChanged = async (
  layoutDir: string,
  publicDir: string,
): Promise<boolean> => {
  if (!await exists(publicDir)) return true;
  const renderTime = await _latestModification(publicDir);
  const layoutTime = await _latestModification(
    layoutDir,
    [".ts", ".tsx"],
  );
  return layoutTime > renderTime;
};
