/*
Copyright 2021 Eric Selin

This file is part of `bob`.

`bob` is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

`bob` is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with `bob`. If not, see <https://www.gnu.org/licenses/>.

Please contact the developers via GitHub <https://www.github.com/ericselin>
or email eric.selin@gmail.com <mailto:eric.selin@gmail.com>
*/

import { assertEquals } from "../deps.ts";
import getParser, { getContentFileParser } from "./parser.ts";

const buildOptions = {
  contentDir: "",
  publicDir: "",
  layoutDir: "",
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

Deno.test("summary works with basic markdown", () => {
  const parse = getParser(buildOptions);

  let actual = parse({
    //@ts-ignore Not needed for this test
    filepath: {},
    content: "# This is some content\n\nAnd a paragraph here.",
  });
  assertEquals(actual.summary, "This is some content And a paragraph here.");

  actual = parse({
    //@ts-ignore Not needed for this test
    filepath: {},
    content:
      "# This is some very long content\n\nAnd a paragraph here. That should be limited to 500 characters. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  });
  assertEquals(
    actual.summary,
    "This is some very long content And a paragraph here. That should be limited to 500 characters. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  );

  actual = parse({
    //@ts-ignore Not needed for this test
    filepath: {},
    content: "This is some content, just some simple content",
  });
  assertEquals(
    actual.summary,
    "This is some content, just some simple content",
  );
});
