import { assertEquals } from "../deps.ts";
import type { ContentBase } from "../domain.ts";
import { parseContentFile, getLookupTable } from "./api.ts";

Deno.test("extremely simple parse case works", () => {
  const parse = parseContentFile(
    JSON.parse,
    (str) => str.toUpperCase(),
  );
  const actual = parse({
    filepath: { contentDir: ".", relativePath: "file.md", outputPath: "file.html" },
    content: '{"param":1}\n---\nhello',
  });
  const expected: ContentBase<unknown> = {
    content: "HELLO",
    filename: { contentDir: ".", relativePath: "file.md", outputPath: "file.html" },
    frontmatter: {
      param: 1
    },
  };
  assertEquals(actual, expected);
});

Deno.test("layout lookup", () => {
  assertEquals(
    getLookupTable("sub/folder/page.md", "layouts"),
    [
      "layouts/sub/folder/page.tsx",
      "layouts/sub/folder/_default.tsx",
      "layouts/sub/_default.tsx",
      "layouts/_default.tsx",
    ]
  );

  assertEquals(
    getLookupTable("page.md", "layouts"),
    [
      "layouts/page.tsx",
      "layouts/_default.tsx",
    ]
  );
});
