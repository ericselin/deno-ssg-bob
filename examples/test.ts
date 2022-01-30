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

import { build } from "../mod.ts";
import { assertEquals, path, walk } from "../deps.ts";
import { MemoryCache } from "../core/cache.ts";

const assertDirectoriesEqual = async (
  actualDir: string,
  expectedDir: string,
) => {
  let actualFileCount = 0;
  for await (const dirEntry of walk(actualDir)) {
    if (!dirEntry.isFile) continue;
    actualFileCount++;
    const actualContents = await Deno.readTextFile(dirEntry.path);
    const relativePath = path.relative(actualDir, dirEntry.path);
    const expectedContents = await Deno.readTextFile(
      path.join(expectedDir, relativePath),
    );
    assertEquals(actualContents, expectedContents);
  }
  let expectedFileCount = 0;
  for await (const dirEntry of walk(expectedDir)) {
    if (!dirEntry.isFile) continue;
    expectedFileCount++;
  }
  assertEquals(actualFileCount, expectedFileCount);
};

const getPaths = (exampleDir: string) => {
  const thisDir = path.relative(
    Deno.cwd(),
    path.fromFileUrl(path.dirname(import.meta.url)),
  );
  return {
    contentDir: path.join(thisDir, exampleDir, "content"),
    layoutDir: path.join(thisDir, exampleDir, "layouts"),
    expectedDir: path.join(thisDir, exampleDir, "expected"),
  };
};

const testExampleDir = (dir: string) =>
  async () => {
    const publicDir = await Deno.makeTempDir({ prefix: "bob-" });
    const paths = getPaths(dir);
    try {
      await build(
        {
          contentDir: paths.contentDir,
          layoutDir: paths.layoutDir,
          publicDir,
          cache: new MemoryCache(),
        },
      );
      await assertDirectoriesEqual(publicDir, paths.expectedDir);
    } finally {
      await Deno.remove(publicDir, { recursive: true });
    }
  };

for await (
  const dirEntry of Deno.readDir(
    path.fromFileUrl(path.dirname(import.meta.url)),
  )
) {
  if (dirEntry.isDirectory) {
    const dirname = dirEntry.name;
    Deno.test(
      `example site ${dirname} builds as expected`,
      testExampleDir(dirname),
    );
  }
}
