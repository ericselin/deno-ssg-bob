import { assertEquals } from "../deps.ts";
import type { Cache, Page, PagesGetter } from "../domain.ts";
import { ContentType } from "../domain.ts";
import {
  createDependencyChecker,
  createDependencyWriter,
} from "./content-dependencies.ts";

const createCache = (): Cache => {
  const cache: Record<string, unknown> = {};
  return {
    get: <T>(key: string) => {
      return Promise.resolve(cache[key] as T);
    },
    put: (key, value) => {
      cache[key] = value;
      return Promise.resolve();
    },
  };
};

const createPage = (
  name: string,
  props: Partial<Page<Record<string, unknown>>>,
): Page => ({
  type: ContentType.Page,
  location: {
    type: ContentType.Page,
    inputPath: `content/${name}`,
    outputPath: `public/${name}`,
    url: new URL(`http://localhost/${name}`),
  },
  ...props,
} as Page);

Deno.test("test local mock cache implementation", async () => {
  const cache = createCache();
  await cache.put("test", "value");
  assertEquals(await cache.get("test"), "value");
});

Deno.test("dependency writer works for title and basic frontmatter elements", async () => {
  const cache = createCache();
  const pagesGetter: PagesGetter = (_) =>
    Promise.resolve([createPage("dependency", {
      title: "My page",
      content: "Some content here",
    })]);
  const depsCache = createDependencyWriter(cache, pagesGetter);

  // get pages
  const pages = await depsCache.getPages("");
  // access title
  pages.map((page) => page.title);
  // write deps
  await depsCache.write(createPage("dependant", {}));

  // create dependency checker
  const checkDeps = createDependencyChecker(cache);

  // no update should occur with only content update
  assertEquals(
    await checkDeps(
      createPage("dependency", {
        title: "My page",
        content: "Updated content",
      }),
    ),
    [],
  );
  // update should occur when also title changed
  assertEquals(
    await checkDeps(
      createPage("dependency", {
        title: "My new page",
        content: "Updated content",
      }),
    ),
    ["content/dependant"],
  );
});
