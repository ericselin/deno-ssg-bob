import type { Change } from "../domain.ts";
import { assertEquals } from "../deps.ts";
import {
  removeDuplicateChanges,
  createInputPathsGetter,
} from "./changes.ts";

Deno.test("content file from public file base case", () => {
  const getPaths = createInputPathsGetter({
    publicDir: "public",
    contentDir: "content",
  });
  assertEquals(
    getPaths("public/something/index.html"),
    [
      "content/something/index.html",
      "content/something.md",
      "content/something/index.md",
    ],
  );
  assertEquals(
    getPaths("public/something/else/here/index.html"),
    [
      "content/something/else/here/index.html",
      "content/something/else/here.md",
      "content/something/else/here/index.md",
    ],
  );
  assertEquals(
    getPaths("public/something/static.jpg"),
    [
      "content/something/static.jpg",
    ],
  );
});

Deno.test("removing duplicates work", () => {
  const hasDuplicates: Change[] = [
    { type: "orphan", outputPath: "public/orphan/index.html" },
    { type: "orphan", outputPath: "public/orphan-2/index.html" },
    { type: "orphan", outputPath: "public/orphan-2/index.html" },
    { type: "create", inputPath: "content/modified.md" },
    { type: "modify", inputPath: "content/modified.md" },
    { type: "create", inputPath: "content/created.md" },
    { type: "create", inputPath: "content/created.md" },
  ];
  const dupsRemoved = hasDuplicates.filter(removeDuplicateChanges);
  assertEquals(dupsRemoved, [
    { type: "orphan", outputPath: "public/orphan/index.html" },
    { type: "orphan", outputPath: "public/orphan-2/index.html" },
    { type: "create", inputPath: "content/modified.md" },
    { type: "modify", inputPath: "content/modified.md" },
    { type: "create", inputPath: "content/created.md" },
  ]);
});

Deno.test("single change does not get sanitized", () => {
  const changes: Change[] = [{
    type: "orphan",
    outputPath: "public/testing/index.html",
  }];
  const dupsRemoved = changes.filter(removeDuplicateChanges);
  assertEquals(dupsRemoved, changes);
});
