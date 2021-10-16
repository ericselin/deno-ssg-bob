import { assertEquals, path } from "../../deps.ts";
import { dependenciesChanged } from "./mod.ts";

/*
This test is to see whether any dependencies of the base
layout have been changed since the last render. This is
done by taking the last modification date of all rendered
files into account and comparing against all dependencies.

The test needs a base site file, `test-base.ts` which
depends on `test-base.ts`. There are should be two public
dirs, `test-after-change` and `test-before-change`. These
should contain files which have been "rendered" (modified)
after or before a change in the `test-base.ts` file,
respectively.

Naturally, checking against "before" should yield true,
and against "after" false.
*/

const dir = path.join(
  path.fromFileUrl(
    path.dirname(import.meta.url),
  ),
  "test",
);

Deno.test("builds after change yields false", async () => {
  assertEquals(
    await dependenciesChanged(
      dir,
      path.join(dir, "after-change"),
    ),
    false,
  );
});

Deno.test("builds before change yields true", async () => {
  assertEquals(
    await dependenciesChanged(
      dir,
      path.join(dir, "before-change"),
    ),
    true,
  );
});

Deno.test("does not crash if public folder non-existent", async () => {
  assertEquals(
    await dependenciesChanged(
      dir,
      path.join(dir, "non-existent"),
    ),
    true,
  );
});
