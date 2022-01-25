import { _getLocations } from "./nginx-locations.ts";
import { assertEquals } from "https://deno.land/std@0.122.0/testing/asserts.ts";

Deno.test("url pattern pathname to location works", () => {
  assertEquals(
    _getLocations([
      "/:shop/:orderid/update-framenr",
      "/literal/path",
    ]),
    [
      "~* ^\\/[^\\/]+\\/[^\\/]+\\/update-framenr$",
      "= /literal/path",
    ],
  );
});
