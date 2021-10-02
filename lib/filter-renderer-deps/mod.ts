import { path, walk } from "../../deps.ts";

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
  scriptPath: string,
  publicPath: string,
): Promise<boolean> => {
  const renderTime = await _latestModification(publicPath);
  const layoutTime = await _latestModification(
    path.dirname(scriptPath),
    [".ts", ".tsx"],
  );
  return layoutTime > renderTime;
};
