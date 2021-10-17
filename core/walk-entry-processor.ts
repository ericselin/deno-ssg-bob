import type { WalkEntryProcessor } from "../domain.ts";
import { path } from "../deps.ts";

export const getPublicPathCreator = (publicPath: string) =>
  (filepath: string): string => {
    const dirPathSegments = filepath.split("/").slice(0, -1);
    const parsedPath = path.parse(filepath);
    if (parsedPath.name === "index") dirPathSegments.push("index.html");
    else dirPathSegments.push(`${parsedPath.name}/index.html`);
    return path.join(publicPath, ...dirPathSegments);
  };

const processWalkEntry: WalkEntryProcessor = ({ contentDir, publicDir, log }) => {
  const createPublicPath = getPublicPathCreator(publicDir);
  return (walkEntry) => {
    if (walkEntry.isFile) {
      const relativeEntryPath = path.relative(contentDir, walkEntry.path);
      const filepath = {
        contentDir: contentDir,
        relativePath: relativeEntryPath,
        outputPath: createPublicPath(relativeEntryPath),
      };
      log?.debug(`Processing ${relativeEntryPath}`);
      return filepath;
    } else {
      throw new Error(`Walk entry ${walkEntry.path} is not a file`);
    }
  };
};

export default processWalkEntry;
