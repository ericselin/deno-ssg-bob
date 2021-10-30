import { assertEquals } from "../deps.ts";
import { getContentFileParser } from "./parser.ts";

const buildOptions = {
  contentDir: '',
  publicDir: '',
  layoutDir: '',
};

Deno.test("extremely simple parse case works", () => {
  const parse = getContentFileParser(
    (str) => str.toUpperCase(),
    JSON.parse,
  )(buildOptions);
  const actual = parse({
    //@ts-ignore Not needed for this test
    filepath: {},
    content: '{"param":1}\n---\nhello',
  });
  assertEquals(actual.content, "HELLO");
  assertEquals(actual.frontmatter, {
    param: 1,
  });
});

Deno.test("parser sets title from frontmatter", () => {
  const parse = getContentFileParser(
    (str) => str,
    JSON.parse,
  )(buildOptions);
  const actual = parse({
    //@ts-ignore Not needed for this test
    filepath: {},
    content: '{"title":"This is a title"}\n---\nhello',
  });
  assertEquals(actual.title, "This is a title");
});

Deno.test("parser sets date from frontmatter", () => {
  const parse = getContentFileParser(
    (str) => str,
    JSON.parse,
  )(buildOptions);
  const actual = parse({
    //@ts-ignore Not needed for this test
    filepath: {},
    content: '{"date":"2021-10-26"}\n---\nhello',
  });
  assertEquals(actual.date?.toString(), new Date("2021-10-26").toString());
});
