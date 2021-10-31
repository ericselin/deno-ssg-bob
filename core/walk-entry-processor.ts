import type { WalkEntryToLocationConverter } from "../domain.ts";
import { ContentType, Logger } from "../domain.ts";
import { path } from "../deps.ts";

let didWarnAboutBaseURL = false;

const getURLCreator = (
  { baseUrl, log }: { baseUrl?: string; log?: Logger },
) => {
  if (!baseUrl && !didWarnAboutBaseURL) {
    didWarnAboutBaseURL = true;
    log?.warning("Base URL not set, using default value");
  }
  if (!baseUrl) {
    baseUrl = "http://localhost";
  }
  return (outputPath: string): URL => {
    const url = new URL(
      outputPath.replace(path.sep, "/").replace("index.html", ""),
      baseUrl,
    );
    log?.debug(`Output path ${outputPath} getting url ${url.toString()}`);
    return url;
  };
};

const getContentType = (filepath: string): ContentType => {
  if (path.extname(filepath) === ".md") return ContentType.Page;
  return ContentType.Static;
};

const getOutputPath = (inputPath: string, type: ContentType): string => {
  const parsedPath = path.parse(inputPath);
  switch (type) {
    case ContentType.Page:
      if (parsedPath.name === "index") {
        return inputPath.replace(parsedPath.ext, ".html");
      } else {
        return inputPath.replace(parsedPath.ext, path.sep + "index.html");
      }
    default:
      return inputPath;
  }
};

const processWalkEntry: WalkEntryToLocationConverter = (
  { baseUrl, contentDir, publicDir, log },
) => {
  const createURL = getURLCreator({ baseUrl, log });
  return ({ path: entryPath }) => {
    const type = getContentType(entryPath);
    const inputPath = path.relative(
      path.join(Deno.cwd(), contentDir),
      entryPath,
    );
    const outputPath = getOutputPath(inputPath, type);
    log?.debug(`Processing ${inputPath}`);
    return {
      type,
      inputPath: path.join(contentDir, inputPath),
      outputPath: path.join(publicDir, outputPath),
      url: createURL(outputPath),
    };
  };
};

export default processWalkEntry;
