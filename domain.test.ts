import { assertEquals } from "./deps.ts";
import { parseContentFile } from "./domain.ts";
import { ContentBase } from "./lib/api.ts";

Deno.test("extremely simple parse case works", () => {
  const parse = parseContentFile(
    JSON.parse,
    (str) => str.toUpperCase(),
  );
  const actual = parse({
    filepath: { contentDir: ".", relativePath: "file.md", outputPath: "file.html" },
    content: '{"param":1}\n---\nhello',
  });
  const expected: ContentBase<unknown, undefined> = {
    content: "HELLO",
    filename: { contentDir: ".", relativePath: "file.md", outputPath: "file.html" },
    type: undefined,
    frontmatter: {
      param: 1
    },
  };
  assertEquals(actual, expected);
});
