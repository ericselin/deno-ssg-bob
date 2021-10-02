import { assertEquals, path } from "../deps.ts";
import { listDirectory } from "./fs.ts";

const dir = path.relative(
  Deno.cwd(),
  path.join(
    path.fromFileUrl(path.dirname(import.meta.url)),
    "fs.test",
  ),
);

Deno.test("directory lister base case", async () => {
  assertEquals(await listDirectory(dir), [
    {
      contentDir: "lib/fs.test",
      relativePath: "file.md",
      outputPath: "public/file/index.html",
    },
    {
      contentDir: "lib/fs.test",
      relativePath: "sub/sub.md",
      outputPath: "public/sub/sub/index.html",
    },
  ]);
});
