import { assertEquals } from "../deps.ts";
import { getLookupTable } from "./layout-loader.ts";

Deno.test("layout lookup", () => {
  assertEquals(
    getLookupTable("sub/folder/page.md", "layouts"),
    [
      "layouts/sub/folder/page.tsx",
      "layouts/sub/folder/_default.tsx",
      "layouts/sub/_default.tsx",
      "layouts/_default.tsx",
    ]
  );

  assertEquals(
    getLookupTable("page.md", "layouts"),
    [
      "layouts/page.tsx",
      "layouts/_default.tsx",
    ]
  );
});
