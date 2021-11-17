import type {
  BuildOptions,
  Cache,
  Logger,
  Page,
  PagesGetter,
} from "../domain.ts";

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
  log?: Logger,
): { getPages: PagesGetter; write: (dependantPage: Page) => Promise<void> } => {
  const deps: ContentDependencies = {};
  return {
    getPages: (wantsPages) =>
      pagesGetter(wantsPages).then((pages) =>
        pages.map((page) => createDependencyProxy(page, deps))
      ),
    write: async (dependantPage) => {
      log?.debug(
        `Page "${dependantPage.location.inputPath}" dependencies: ${
          JSON.stringify(deps, undefined, 2)
        }`,
      );
      await Promise.all(
        Object.entries(deps).map(async ([depencencyPath, accessedProps]) => {
          await cache.put<ContentDependants>(`${depencencyPath}.dependants`, {
            [dependantPage.location.inputPath]: accessedProps,
          });
        }),
      );
    },
  };
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
    console.log("dependants", dependants);
    return Object.entries(dependants).filter(
      ([_dependantPath, accessedProps]) => {
        console.log("page", page, "accessed", accessedProps);
        for (const [key, value] of Object.entries(accessedProps)) {
          console.log("key", key, "value", value, "page", page[key as keyof Page]);
          if (page[key as keyof Page] !== value) return true;
        }
        return false;
      },
    ).map(([dependantPath]) => dependantPath);
  };

const createDependencyCacheWriter = (options: BuildOptions) => {
  const { log } = options;
  return async (page: Page, deps: ContentDependencies): Promise<void> => {
    await Promise.resolve();
    log?.debug(
      `Dependencies for "${page.location.inputPath}": ${
        JSON.stringify(deps, undefined, 2)
      }`,
    );
  };
};
