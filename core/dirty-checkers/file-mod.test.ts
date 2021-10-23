import { assertEquals, path } from "../../deps.ts";
import { BuildOptions } from "../../domain.ts";
import shouldRender from "./file-mod.ts";

const dir = path.join(
  path.fromFileUrl(path.dirname(import.meta.url)),
  "file-mod-test",
);

const resetModTime = async (pathSegments: string[]) => {
  const fullPath = path.join(dir, ...pathSegments);
  return await Deno.writeTextFile(fullPath, await Deno.readTextFile(fullPath));
};
// reset mod time of file 2
await resetModTime(["public", "2.html"]);
// sleep 1
await new Promise((resolve) => setTimeout(resolve, 100));
// reset mod time of file 3
await resetModTime(["content", "3.md"]);

Deno.test("returns true if content newer than output", async () => {
  assertEquals(
    await shouldRender({} as BuildOptions)({
      contentDir: path.join(dir, "content"),
      relativePath: "3.md",
      outputPath: path.join(dir, "public", "2.html"),
    }),
    true,
  );
});

Deno.test("returns false if content older than output", async () => {
  assertEquals(
    await shouldRender({} as BuildOptions)({
      contentDir: path.join(dir, "content"),
      relativePath: "1.md",
      outputPath: path.join(dir, "public", "2.html"),
    }),
    false,
  );
});

Deno.test("returns true if output not found", async () => {
  assertEquals(
    await shouldRender({} as BuildOptions)({
      contentDir: path.join(dir, "content"),
      relativePath: "1.md",
      outputPath: "not-found.html",
    }),
    true,
  );
});
