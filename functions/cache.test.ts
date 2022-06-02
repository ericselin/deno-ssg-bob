import { assertEquals } from "../deps.ts";
import { path } from "../deps.ts";
import { _requestToCacheFilepath } from "./cache.ts";

Deno.test("regular base case html with trailing slash works", () => {
  assertEquals(
    _requestToCacheFilepath("public")("http:localhost/my/path/here/", "text/html"),
    path.join("public", "my", "path", "here", "index.html"),
  );
});

Deno.test("regular base case non-html works", () => {
  assertEquals(
    _requestToCacheFilepath("public")("http:localhost/my/path/file.txt"),
    path.join("public", "my", "path", "file.txt"),
  );
});

Deno.test("html with no trailing slash should return undefined", () => {
  assertEquals(
    _requestToCacheFilepath("public")("http:localhost/my/path/file.html", "text/html"),
    undefined,
  );
  assertEquals(
    _requestToCacheFilepath("public")("http:localhost/my/path/file", "text/html"),
    undefined,
  );
});

Deno.test("non-html directory should return undefined", () => {
  assertEquals(
    _requestToCacheFilepath("public")("http:localhost/my/path/"),
    undefined,
  );
  assertEquals(
    _requestToCacheFilepath("public")("http:localhost/my/path/", "application/json"),
    undefined,
  );
});
