import { assertEquals } from "../deps.ts";
import { _createInputPathsGetter } from "./changes-fs.ts";

Deno.test("content file from public file base case", () => {
  const getPaths = _createInputPathsGetter({
    publicDir: "public",
    contentDir: "content",
  });
  assertEquals(
    getPaths("public/something/index.html"),
    [
      "content/something/index.html",
      "content/something.md",
      "content/something/index.md",
    ],
  );
  assertEquals(
    getPaths("public/something/else/here/index.html"),
    [
      "content/something/else/here/index.html",
      "content/something/else/here.md",
      "content/something/else/here/index.md",
    ],
  );
  assertEquals(
    getPaths("public/something/static.jpg"),
    [
      "content/something/static.jpg",
    ],
  );
});
