import { assert, path } from "../../deps.ts";
import { BuildOptions } from "../../domain.ts";
import { shouldRender } from "./mod.ts";

const dir = path.fromFileUrl(path.dirname(import.meta.url));

Deno.test("returns true if content newer than output", async () => {
  assert(
    await shouldRender({} as BuildOptions)({
      contentDir: dir,
      relativePath: "2.md",
      outputPath: "1.html",
    }),
  );
});

Deno.test("returns false if content older than output", async () => {
  assert(
    await shouldRender({} as BuildOptions)({
      contentDir: dir,
      relativePath: "2.md",
      outputPath: "1.html",
    }),
  );
});

Deno.test("returns true if output not found", async () => {
  assert(
    await shouldRender({} as BuildOptions)({
      contentDir: dir,
      relativePath: "2.md",
      outputPath: "2.html",
    }),
  );
});
