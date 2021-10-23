import { assert, assertEquals, path, exists } from "../../deps.ts";
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
  assert(await exists(dir1));
  assert(await exists(dir2));
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
