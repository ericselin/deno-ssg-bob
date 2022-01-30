import type { Cache, Logger, Page, PagesGetter } from "../domain.ts";
import { path } from "../deps.ts";

type ContentDependencies = {
  [dependencyPath: string]: {
    [property: string]: string;
  };
};

type ContentDependants = {
  [dependantPath: string]: {
    [property: string]: string;
  };
};

const createDependencyProxy = (target: Page, deps: ContentDependencies) =>
  new Proxy(target, {
    get: function (page: Page, prop: string) {
      const value = Reflect.get(page, prop);
      const dependencyPath = page.location.inputPath;
      deps[dependencyPath] ??= {};
      deps[dependencyPath][prop] = typeof value === "object"
        ? "[object]"
        : value;
      return value;
    },
  });

/**
Create proxy for recording page dependencies. Last return is a function that should be called
in order to commit (save) the dependencies to the cache.
*/
export const createDependencyWriter = (
  cache: Cache,
  pagesGetter: PagesGetter,
  contentDir: string,
  log?: Logger,
): {
  getPages: PagesGetter;
  write: (path: string) => Promise<void>;
  getDependants: (path: string) => Promise<string[]>;
} => {
  const deps: ContentDependencies = {};
  /** Array of getPages globs */
  const globs: string[] = [];
  return {
    getPages: async (wantsPages) => {
      if (typeof wantsPages === "string") {
        globs.push(path.join(contentDir, wantsPages));
      } else {
        wantsPages.forEach((glob) => {
          globs.push(path.join(contentDir, glob));
        });
      }
      const pages = await pagesGetter(wantsPages);
      return pages.map((page) => createDependencyProxy(page, deps));
    },
    write: async (path) => {
      log?.debug(`Page "${path}" globs used: ${JSON.stringify(globs)}`);
      log?.debug(
        `Page "${path}" dependencies: ${JSON.stringify(deps, undefined, 2)}`,
      );
      await Promise.all(
        Object.entries(deps)
          // don't create a dependency to the page itself
          .filter(([depencencyPath]) => depencencyPath !== path)
          // create cache transactions for each write
          .map(async ([depencencyPath, accessedProps]) => {
            await Promise.all([
              cache.add(
                `${depencencyPath}.dependants`,
                { [path]: accessedProps },
              ),
              cache.add("getPages.globs", { [path]: globs }),
            ]);
          }),
      );
    },
    getDependants: async (path) => {
      const deps = await cache.get<ContentDependants | undefined>(
        `${path}.dependants`,
      );
      if (!deps) return [];
      const paths = Object.keys(deps);
      log?.debug(
        `Got page "${path} dependants: ${paths.join(", ")}"`,
      );
      return paths;
    },
  };
};

/**
 * Read dependants for a page given the input path.
 */
export const createDependantsReader = (cache: Cache, log?: Logger) =>
  async (path: string) => {
    const deps = await cache.get<ContentDependants | undefined>(
      `${path}.dependants`,
    );
    if (!deps) return [];
    const paths = Object.keys(deps);
    log?.debug(
      `Got page "${path} dependants: ${paths.join(", ")}"`,
    );
    return paths;
  };

/**
Check if the dependants of a particular page need updating.
*/
export const createDependencyChecker = (cache: Cache, log?: Logger) =>
  /**
  @returns Array of `inputPath`s of content files that need re-rendering.
  */
  async (page: Page): Promise<string[]> => {
    const dependants = await cache.get<ContentDependants>(
      `${page.location.inputPath}.dependants`,
    );
    log?.debug(`Page "${page.location.inputPath}" dependants: ${dependants}`);
    return Object.entries(dependants || {}).filter(
      ([_dependantPath, accessedProps]) => {
        for (const [key, value] of Object.entries(accessedProps)) {
          if (page[key as keyof Page] !== value) return true;
        }
        return false;
      },
    ).map(([dependantPath]) => dependantPath);
  };

/**
 * Delete cache of dependants at a particular input path.
 */
export const createDependencyPurger = (cache: Cache) =>
  async (path: string): Promise<void> => {
    await Promise.all([
      cache.delete(`${path}.dependants`),
      cache.deleteFrom("getPages.globs", path),
    ]);
  };

export const _matchGlobs = (
  /**
   * Object with page input path as the key, and an array
   * of globs used by this page as the value.
   */
  getPagesGlobs: Record<string, string[]>,
  /**
   * Newly created page input path.
   */
  createdPagePath: string,
): string[] =>
  Object.entries(getPagesGlobs).filter(([_inputPath, globs]) =>
    globs.some((glob) => path.globToRegExp(glob).test(createdPagePath))
  ).map(([inputPath]) => inputPath);

/**
 * Get pages that will depend on a newly created page based on the
 * globs layouts use for `getPages`
 */
export const createNewDependantsGetter = (cache: Cache) =>
  /**
   * @param createPagePath [string] Newly create page input path
   * @return Array of page input paths for pages that want this new page
   */
  async (createdPagePath: string): Promise<string[]> => {
    const globs = await cache.get<Record<string, string[]>>("getPages.globs");
    if (!globs) return [];
    return _matchGlobs(globs, createdPagePath);
  };
