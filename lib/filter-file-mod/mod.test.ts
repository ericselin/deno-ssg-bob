import { assertEquals } from "../../deps.ts";
import { shouldRender } from "./mod.ts";

Deno.test("returns true if content newer than output", async () => {
  assertEquals(
    await shouldRender({
      contentDir: ".",
      relativePath: "2.md",
      outputPath: "1.html",
    }),
    true,
  );
});

Deno.test("returns false if content older than output", async () => {
  assertEquals(
    await shouldRender({
      contentDir: ".",
      relativePath: "2.md",
      outputPath: "1.html",
    }),
    true,
  );
});

Deno.test("returns true if output not found", async () => {
  assertEquals(
    await shouldRender({
      contentDir: ".",
      relativePath: "2.md",
      outputPath: "2.html",
    }),
    true,
  );
});
