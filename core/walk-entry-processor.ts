/*
Copyright 2021 Eric Selin

This file is part of `bob`.

`bob` is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

`bob` is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with `bob`. If not, see <https://www.gnu.org/licenses/>.

Please contact the developers via GitHub <https://www.github.com/ericselin>
or email eric.selin@gmail.com <mailto:eric.selin@gmail.com>
*/

import type { WalkEntryToLocationConverter } from "../domain.ts";
import { ContentType, Logger } from "../domain.ts";
import { path } from "../deps.ts";

const createPathnameFromOutputPath = (outputPath: string): string =>
  outputPath.replace(path.sep, "/").replace("index.html", "");

const getURLCreator = (
  { baseUrl, log }: { baseUrl?: string; log?: Logger },
) => {
  if (!baseUrl) {
    baseUrl = "http://localhost";
  }
  return (outputPath: string): URL => {
    const url = new URL(
      createPathnameFromOutputPath(outputPath),
      baseUrl,
    );
    log?.warning("DEPRECATED: `Location.url` Please use `Page.pathname` instead");
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
      contentPath: inputPath,
      pathname: createPathnameFromOutputPath(outputPath),
      get url() {
        return createURL(outputPath);
      },
    };
  };
};

export default processWalkEntry;
