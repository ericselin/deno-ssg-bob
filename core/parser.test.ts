import { assertEquals } from "../deps.ts";
import type { ContentBase } from "../domain.ts";
import { parseContentFile } from "./parser.ts";

Deno.test("extremely simple parse case works", () => {
  const parse = parseContentFile(
    (str) => str.toUpperCase(),
    JSON.parse,
  );
  const actual = parse({
    //@ts-ignore Not needed for this test
    filepath: {},
    content: '{"param":1}\n---\nhello',
  });
  const expected: ContentBase<{ param: number }> = {
    content: "HELLO",
    //@ts-ignore Not needed for this test
    filepath: {},
    frontmatter: {
      param: 1,
    },
  };
  assertEquals(actual, expected);
});
