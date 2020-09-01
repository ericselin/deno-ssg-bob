import { assertEquals } from "./deps.ts";
import { parseContentFile, RawFrontmatter } from "./domain.ts";
import { ContentBase } from "./api.ts";

Deno.test("extremely simple parse case works", () => {
  const parse = parseContentFile(
    JSON.parse,
    (str) => str.toUpperCase(),
  );
  const actual = parse({
    filename: "file.md",
    content: '{"param":1}\n---\nhello',
  });
  const expected: ContentBase<any, undefined> = {
    content: "HELLO",
    filename: "file.md",
    frontmatter: {
      param: 1
    },
  };
  assertEquals(actual, expected);
});
