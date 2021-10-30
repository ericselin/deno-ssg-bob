import type { BuildOptions, WalkEntryProcessor } from "../domain.ts";
import { path } from "../deps.ts";

export const getPublicPathCreator = (publicPath: string) =>
  (filepath: string): string => {
    const dirPathSegments = filepath.split("/").slice(0, -1);
    const parsedPath = path.parse(filepath);
    if (parsedPath.name === "index") dirPathSegments.push("index.html");
    else dirPathSegments.push(`${parsedPath.name}/index.html`);
    return path.join(publicPath, ...dirPathSegments);
  };

export const getURLCreator = (options: BuildOptions) => {
  let { baseUrl, log } = options;
  if (!baseUrl) {
    log?.warning("Base URL not set, using default value");
    baseUrl = "http://localhost";
  }
  return (relativeEntryPath: string): URL => {
    const parsedPath = path.parse(relativeEntryPath);
    const dirPathSegments = parsedPath.dir.split(path.sep);
    if (parsedPath.name !== "index") dirPathSegments.push(parsedPath.name);
    const pathname = "/" +
        dirPathSegments.length
      ? dirPathSegments.join("/") + "/"
      : "";
    const url = new URL(pathname, baseUrl);
    log?.debug(`Page ${relativeEntryPath} getting url ${url.toString()}`);
    return url;
  };
};

const processWalkEntry: WalkEntryProcessor = (options) => {
  const { contentDir, publicDir, log } = options;
  const createPublicPath = getPublicPathCreator(publicDir);
  const createURL = getURLCreator(options);
  return (walkEntry) => {
    if (walkEntry.isFile) {
      const relativeEntryPath = path.relative(contentDir, walkEntry.path);
      const filepath = {
        contentDir: contentDir,
        relativePath: relativeEntryPath,
        outputPath: createPublicPath(relativeEntryPath),
        url: createURL(relativeEntryPath),
      };
      log?.debug(`Processing ${relativeEntryPath}`);
      return filepath;
    } else {
      throw new Error(`Walk entry ${walkEntry.path} is not a file`);
    }
  };
};

export default processWalkEntry;
