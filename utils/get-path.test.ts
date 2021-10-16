import { assertEquals } from "../deps.ts";
import { getPath } from "./get-path.ts";

Deno.test("get content path is readable", async () => {
  const path = getPath(import.meta.url, "get-path.ts");
  const contents = await Deno.readTextFile(path);
  assertEquals(contents.length > 0, true);
});
