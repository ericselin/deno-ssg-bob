import { assertEquals } from "../deps.ts";
import type { Page, PagesGetter } from "../domain.ts";
import { ContentType } from "../domain.ts";
import { MemoryCache } from "./cache.ts";
import {
  _matchGlobs,
  createDependencyChecker,
  createDependencyWriter,
} from "./content-dependencies.ts";

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

Deno.test("dependency writer works for title", async () => {
  const cache = new MemoryCache();
  const pagesGetter: PagesGetter = (_) =>
    Promise.resolve([createPage("dependency", {
      title: "My page",
      content: "Some content here",
    })]);
  const depsCache = createDependencyWriter(cache, pagesGetter, "");

  // get pages
  const pages = await depsCache.getPages("");
  // access title
  pages.map((page) => page.title);
  // write deps
  await depsCache.write("dependant");

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
    ["dependant"],
  );
});

Deno.test("dependency writer works for concurrent builds", async () => {
  const cache = new MemoryCache();
  const pagesGetter: PagesGetter = (_) =>
    Promise.resolve([createPage("dependency", {
      title: "My page",
    })]);
  const depsCache = createDependencyWriter(cache, pagesGetter, "");

  // get pages
  const pages = await depsCache.getPages("");
  // access title
  pages.map((page) => page.title);
  // write deps
  await Promise.all([
    depsCache.write("dependant-1"),
    depsCache.write("dependant-2"),
  ]);

  // create dependency checker
  const checkDeps = createDependencyChecker(cache);

  // no update should occur with only content update
  assertEquals(
    await checkDeps(
      createPage("dependency", {
        title: "My page",
      }),
    ),
    [],
  );
  // update should occur when also title changed
  assertEquals(
    await checkDeps(
      createPage("dependency", {
        title: "My new page",
      }),
    ),
    ["dependant-1", "dependant-2"],
  );
});

Deno.test("created page matcher works", () => {
  const globs = {
    "page-1": ["**/*.md"],
    "page-2": ["*/*.md"],
    "page-3": ["dir/**/*.md"],
    "page-4": ["sub/*/*.md"],
    "page-5": ["**/*.md"],
  };
  assertEquals(_matchGlobs(globs, "sub/dir/page.md"), [
    "page-1",
    "page-4",
    "page-5",
  ]);
  assertEquals(_matchGlobs(globs, "index.md"), ["page-1", "page-5"]);
});
