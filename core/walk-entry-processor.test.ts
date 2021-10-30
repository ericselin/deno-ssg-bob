import { assertEquals } from "../deps.ts";
import { getURLCreator } from "./walk-entry-processor.ts";

const defaultOptions = {
  contentDir: "content",
  layoutDir: "layout",
  publicDir: "public",
};

Deno.test("md file url pathname is correct", () => {
  const createURL = getURLCreator(defaultOptions);
  assertEquals(createURL("blog/post.md").pathname, "/blog/post/");
  assertEquals(createURL("blog/index.md").pathname, "/blog/");
  assertEquals(createURL("index.md").pathname, "/");
});

Deno.test("md file whole url is correct", () => {
  const createURL = getURLCreator({
    ...defaultOptions,
    baseUrl: "https://mypage.com",
  });
  assertEquals(
    createURL("blog/post.md").toString(),
    "https://mypage.com/blog/post/",
  );
});
