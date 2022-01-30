import { delay } from "https://deno.land/std/async/mod.ts";
import { assertEquals } from "../deps.ts";
import { FileCache, MemoryCache } from "./cache.ts";

Deno.test("memory cache add works", async () => {
  const cache = new MemoryCache();
  await Promise.all([
    delay(100).then(() => cache.add("test", { a: "third" })),
    delay(1).then(() => cache.add("test", { b: "second" })),
    cache.add("test", { c: "first" }),
  ]);
  assertEquals(await cache.get("test"), {
    a: "third",
    b: "second",
    c: "first",
  });
});

Deno.test("file cache add works", async () => {
  const tempDir = await Deno.makeTempDir();
  const cache = new FileCache(tempDir);
  try {
    await Promise.all([
      cache.add("test", { a: "third" }),
      cache.add("test", { b: "second" }),
      cache.add("test", { c: "first" }),
    ]);
    assertEquals(await cache.get("test"), {
      a: "third",
      b: "second",
      c: "first",
    });
  } finally {
    await Deno.remove(tempDir, { recursive: true });
  }
});
