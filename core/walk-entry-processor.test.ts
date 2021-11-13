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

import { ContentType } from "../domain.ts";
import { assertEquals, path, WalkEntry } from "../deps.ts";
import createWalkEntryProcessor from "./walk-entry-processor.ts";

const getLocation = createWalkEntryProcessor({
  contentDir: "content",
  layoutDir: "layout",
  publicDir: "public",
  baseUrl: "https://mypage.com",
});

//@ts-ignore Partial includes needed properties
const getWalkEntry = (path: string, isFile = true): WalkEntry => ({
  path,
  isFile,
});

const locationFrom = (path: string) => getLocation(getWalkEntry(path));

Deno.test("md file url pathname is correct", () => {
  assertEquals(locationFrom("blog/post.md").url.pathname, "/blog/post/");
  assertEquals(locationFrom("blog/index.md").url.pathname, "/blog/");
  assertEquals(locationFrom("index.md").url.pathname, "/");
});

Deno.test("md file whole url is correct", () => {
  assertEquals(
    locationFrom("blog/post.md").url.toString(),
    "https://mypage.com/blog/post/",
  );
});

Deno.test("location input and output relative", () => {
  const location = locationFrom(
    path.join(Deno.cwd(), "content", "blog", "index.md"),
  );
  assertEquals(location.inputPath, path.join("content", "blog", "index.md"));
  assertEquals(location.outputPath, path.join("public", "blog", "index.html"));
});

Deno.test("html has static location", () => {
  const location = locationFrom("content/dir/page.html");
  assertEquals(location.inputPath, "content/dir/page.html");
  assertEquals(location.outputPath, "public/dir/page.html");
  assertEquals(location.type, ContentType.Static);
  assertEquals(location.url.pathname, "/dir/page.html");
});
