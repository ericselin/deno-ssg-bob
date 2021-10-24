import { assertEquals } from "../deps.ts";
import type { ContentBase } from "../domain.ts";
import { parseContentFile } from "./parser.ts";

Deno.test("extremely simple parse case works", () => {
  const parse = parseContentFile(
    (str) => str.toUpperCase(),
    JSON.parse,
  );
  const actual = parse({
    filepath: {
      contentDir: ".",
      relativePath: "file.md",
      outputPath: "file.html",
    },
    content: '{"param":1}\n---\nhello',
  });
  const expected: ContentBase<{ param: number }> = {
    content: "HELLO",
    filepath: {
      contentDir: ".",
      relativePath: "file.md",
      outputPath: "file.html",
    },
    frontmatter: {
      param: 1,
    },
  };
  assertEquals(actual, expected);
});
