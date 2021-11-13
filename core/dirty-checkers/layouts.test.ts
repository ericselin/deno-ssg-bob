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

import { assert, assertEquals, exists, path } from "../../deps.ts";
import { isOlder } from "./layouts.ts";

const dir = path.join(
  path.fromFileUrl(
    path.dirname(import.meta.url),
  ),
  "layouts-test",
);

Deno.test("compare is older than base (1 < 2)", async () => {
  const dir1 = path.join(dir, "1");
  const dir2 = path.join(dir, "2");
  const dir1file = path.join(dir1, "index.html");
  const dir2file = path.join(dir2, "index.html");

  assert(await exists(dir1));
  assert(await exists(dir2));
  assert(await exists(dir1file));
  assert(await exists(dir2file));

  // set the modification times in order
  await Deno.writeTextFile(dir1file, await Deno.readTextFile(dir1file));
  await new Promise((resolve) => setTimeout(resolve, 100));
  await Deno.writeTextFile(dir2file, await Deno.readTextFile(dir2file));

  assertEquals(
    await isOlder(dir1, dir2),
    true,
  );
});

Deno.test("compare is older if it doesn't exist", async () => {
  const dir1 = path.join(dir, "1");
  const dirNo = path.join(dir, "non-existent");
  assert(await exists(dir1));
  assert(!await exists(dirNo));
  assertEquals(
    await isOlder(dirNo, dir1),
    true,
  );
});
