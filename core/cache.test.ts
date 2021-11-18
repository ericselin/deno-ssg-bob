import { delay } from "https://deno.land/std/async/mod.ts";
import { assertEquals } from "../deps.ts";
import { MemoryCache } from "./cache.ts";

Deno.test("memory cache implementation works", async () => {
  const cache = new MemoryCache();
  await cache.put("test", "value");
  assertEquals(await cache.get("test"), "value");
  // create concurrent transactions
  await Promise.all([
    cache.transaction("test", async (cache, key) => {
      const curr = await cache.get(key);
      await delay(100);
      await cache.put(key, curr + " first");
    }),
    cache.transaction("test", async (cache, key) => {
      const curr = await cache.get(key);
      await delay(1);
      await cache.put(key, curr + " second");
    }),
    cache.transaction("test", async (cache, key) => {
      const curr = await cache.get(key);
      cache.put(key, curr + " third");
    }),
  ]);
  assertEquals(await cache.get("test"), "value first second third");
})
