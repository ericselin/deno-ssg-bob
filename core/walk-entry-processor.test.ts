import { ContentType } from "../domain.ts";
import { assertEquals, path, WalkEntry } from "../deps.ts";
import createWalkEntryProcessor from "./walk-entry-processor.ts";

const getLocation = createWalkEntryProcessor({
  contentDir: "content",
  layoutDir: "layout",
  publicDir: "public",
  baseUrl: "https://mypage.com",
});

//@ts-ignore Partial includes needed properties
const getWalkEntry = (path: string, isFile = true): WalkEntry => ({
  path,
  isFile,
});

const locationFrom = (path: string) => getLocation(getWalkEntry(path));

Deno.test("md file url pathname is correct", () => {
  assertEquals(locationFrom("blog/post.md").url.pathname, "/blog/post/");
  assertEquals(locationFrom("blog/index.md").url.pathname, "/blog/");
  assertEquals(locationFrom("index.md").url.pathname, "/");
});

Deno.test("md file whole url is correct", () => {
  assertEquals(
    locationFrom("blog/post.md").url.toString(),
    "https://mypage.com/blog/post/",
  );
});

Deno.test("location input and output relative", () => {
  const location = locationFrom(
    path.join(Deno.cwd(), "content", "blog", "index.md"),
  );
  assertEquals(location.inputPath, path.join("content", "blog", "index.md"));
  assertEquals(location.outputPath, path.join("public", "blog", "index.html"));
});

Deno.test("html has static location", () => {
  const location = locationFrom("content/dir/page.html");
  assertEquals(location.inputPath, "content/dir/page.html");
  assertEquals(location.outputPath, "public/dir/page.html");
  assertEquals(location.type, ContentType.Static);
  assertEquals(location.url.pathname, "/dir/page.html");
});
