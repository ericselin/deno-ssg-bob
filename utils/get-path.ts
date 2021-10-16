import { path } from "../deps.ts";

export const getPath = (moduleUrl: string, relativePath: string): string => {
  return path.fromFileUrl(path.join(path.dirname(moduleUrl), relativePath));
};
