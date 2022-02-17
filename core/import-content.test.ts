import type { ContentImporter, ImportedContent } from "../mod.ts";
import { assertEquals, assert } from "../deps.ts";
import { MemoryCache } from "./cache.ts";
import { importContent, lastUpdateCacheKey } from "./import-content.ts";

Deno.test("base case import content works", async () => {
  const content = { contentPath: "path.md", data: { title: "title" } };
  async function* gen(): ContentImporter {
    yield content;
  }
  let writeCount = 0;
  const write = (c: ImportedContent) => {
    assertEquals(c, content);
    writeCount++;
    return Promise.resolve();
  };
  const memCache = new MemoryCache();
  const importer = gen();
  await importContent(importer, "", memCache, undefined, write);
  assertEquals(writeCount, 1);
});

Deno.test("content importer yields in last update, otherwise undefined", async () => {
  const content = { contentPath: "path.md", data: { title: "title" } };
  const memCache = new MemoryCache();
  let dateEpochExpected: number | undefined;
  let writeCount = 0;

  async function* gen(): ContentImporter {
    const date = (yield) as Date | undefined;
    assertEquals(date?.valueOf(), dateEpochExpected);
    yield content;
  }

  const write = (c: ImportedContent) => {
    assertEquals(c, content);
    writeCount++;
    return Promise.resolve();
  };

  dateEpochExpected = undefined;
  await importContent(gen(), "", memCache, undefined, write);
  assert(await memCache.get(lastUpdateCacheKey));

  await memCache.put(lastUpdateCacheKey, new Date(0));
  dateEpochExpected = 0;
  await importContent(gen(), "", memCache, undefined, write);

  assertEquals(writeCount, 2);
});
