import { assertEquals, path } from "../../deps.ts";
import { BuildOptions } from "../../domain.ts";
import { shouldRender } from "./mod.ts";

const dir = path.fromFileUrl(path.dirname(import.meta.url));

Deno.test("returns true if content newer than output", async () => {
  assertEquals(
    await shouldRender({} as BuildOptions)({
      contentDir: dir,
      relativePath: "2.md",
      outputPath: "1.html",
    }),
    true,
  );
});

Deno.test("returns false if content older than output", async () => {
  assertEquals(
    await shouldRender({} as BuildOptions)({
      contentDir: dir,
      relativePath: "2.md",
      outputPath: "1.html",
    }),
    true,
  );
});

Deno.test("returns true if output not found", async () => {
  assertEquals(
    await shouldRender({} as BuildOptions)({
      contentDir: dir,
      relativePath: "2.md",
      outputPath: "2.html",
    }),
    true,
  );
});
