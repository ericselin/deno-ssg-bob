import { assertEquals, path } from "../../deps.ts";
import { isOlder } from "./mod.ts";

const dir = path.join(
  path.fromFileUrl(
    path.dirname(import.meta.url),
  ),
  "test",
);

Deno.test("compare is older than base (1 < 2)", async () => {
  assertEquals(
    await isOlder(
      path.join(dir, "1"),
      path.join(dir, "2"),
    ),
    true,
  );
});

Deno.test("compare is older if it doesn't exist", async () => {
  assertEquals(
    await isOlder(
      path.join(dir, "non-existent"),
      path.join(dir, "1"),
    ),
    true,
  );
});
