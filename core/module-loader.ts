import { path } from "../deps.ts";

export const loadIfExists = async (scriptPath: string) => {
  // Construct a file URL in order to be able to load
  // local modules from remote scripts
  const fullPath = path.toFileUrl(
    path.join(Deno.cwd(), scriptPath),
  ).toString();
  try {
    return await import(fullPath);
  } catch (e) {
    if (e.message === `Cannot load module "${fullPath}".`) return undefined;
    if (e.message === `Module not found "${fullPath}".`) return undefined;
    throw e;
  }
};
