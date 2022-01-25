import type { Logger } from "../domain.ts";
import type { Functions } from "./mod.ts";

export const _extractPathnames = (functions: Functions): string[] =>
  functions.map(([pathname]) => pathname);

export const _getLocations = (pathnames: string[]): string[] => {
  const fragmentMatcher = /:[^\\\/]+/g;
  return pathnames.map((path) => {
    if (fragmentMatcher.test(path)) {
      return `~* ^${
        path.replaceAll("/", "\\/").replaceAll(fragmentMatcher, "[^\\/]+")
      }$`;
    }
    return `= ${path}`;
  });
};

export const _getConfig = (hostname: string, port: number) =>
  (locations: string[]) =>
    locations.map((location) =>
      `location ${location} {\n  proxy_pass http://${hostname}:${port.toString()};\n}`
    ).join("\n");

export const _writeFile = (filepath: string) =>
  (config: string) => Deno.writeTextFile(filepath, config);

export const writeNginxLocations = (
  options: {
    log?: Logger;
    functions: Functions;
    filepath: string;
    hostname: string;
    port: number;
  },
) =>
  Promise.resolve(options.functions)
    .then(_extractPathnames)
    .then(_getLocations)
    .then(_getConfig(options.hostname, options.port))
    .then(_writeFile(options.filepath));
