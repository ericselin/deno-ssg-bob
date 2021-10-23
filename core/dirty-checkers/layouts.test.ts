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
