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

import { assertEquals, path } from "../../deps.ts";
import { BuildOptions, ContentType } from "../../domain.ts";
import shouldRender from "./file-mod.ts";

const dir = path.join(
  path.fromFileUrl(path.dirname(import.meta.url)),
  "file-mod-test",
);

const resetModTime = async (pathSegments: string[]) => {
  const fullPath = path.join(dir, ...pathSegments);
  return await Deno.writeTextFile(fullPath, await Deno.readTextFile(fullPath));
};
// reset mod time of file 2
await resetModTime(["public", "2.html"]);
// sleep 1
await new Promise((resolve) => setTimeout(resolve, 100));
// reset mod time of file 3
await resetModTime(["content", "3.md"]);

Deno.test("returns true if content newer than output", async () => {
  assertEquals(
    await shouldRender({} as BuildOptions)({
      type: ContentType.Unknown,
      inputPath: path.join(dir, "content", "3.md"),
      outputPath: path.join(dir, "public", "2.html"),
      contentPath: "",
      url: new URL('https://test.com'),
    }),
    true,
  );
});

Deno.test("returns false if content older than output", async () => {
  assertEquals(
    await shouldRender({} as BuildOptions)({
      type: ContentType.Unknown,
      inputPath: path.join(dir, "content", "1.md"),
      outputPath: path.join(dir, "public", "2.html"),
      contentPath: "",
      url: new URL('https://test.com'),
    }),
    false,
  );
});

Deno.test("returns true if output not found", async () => {
  assertEquals(
    await shouldRender({} as BuildOptions)({
      type: ContentType.Unknown,
      inputPath: path.join(dir, "content", "1.md"),
      outputPath: "not-found.html",
      contentPath: "",
      url: new URL('https://test.com'),
    }),
    true,
  );
});
