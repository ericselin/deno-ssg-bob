import { build } from "../../../mod.ts";
import { MemoryCache } from "../../../core/cache.ts";
import { assertEquals, path, walk } from "../../../deps.ts";

const assertDirectoriesEqual = async (
  actualDir: string,
  expectedDir: string,
) => {
  let actualFileCount = 0;
  for await (const dirEntry of walk(actualDir)) {
    if (!dirEntry.isFile) continue;
    actualFileCount++;
    const actualContents = await Deno.readTextFile(dirEntry.path);
    const relativePath = path.relative(actualDir, dirEntry.path);
    const expectedContents = await Deno.readTextFile(
      path.join(expectedDir, relativePath),
    );
    assertEquals(actualContents, expectedContents);
  }
  let expectedFileCount = 0;
  for await (const dirEntry of walk(expectedDir)) {
    if (!dirEntry.isFile) continue;
    expectedFileCount++;
  }
  assertEquals(actualFileCount, expectedFileCount);
};

const getPaths = (exampleDir: string) => {
  const thisDir = path.relative(
    Deno.cwd(),
    path.fromFileUrl(path.dirname(import.meta.url)),
  );
  return {
    contentDir: path.join(thisDir, exampleDir, "content"),
    layoutDir: path.join(thisDir, exampleDir, "layouts"),
    expectedDir: path.join(thisDir, exampleDir, "expected"),
  };
};

const testExampleDir = (dir: string) =>
  async () => {
    const publicDir = await Deno.makeTempDir({ prefix: "bob-" });
    const paths = getPaths(dir);
    try {
      await build(
        {
          contentDir: paths.contentDir,
          layoutDir: paths.layoutDir,
          publicDir,
          cache: new MemoryCache(),
        },
      );
      await assertDirectoriesEqual(publicDir, paths.expectedDir);
    } finally {
      await Deno.remove(publicDir, { recursive: true });
    }
  };

// only run if not inside a public folder
if (!import.meta.url.includes("public")) {
  for await (
    const dirEntry of Deno.readDir(
      path.fromFileUrl(path.dirname(import.meta.url)),
    )
  ) {
    if (dirEntry.isDirectory) {
      const dirname = dirEntry.name;
      Deno.test(
        `example site ${dirname} builds as expected`,
        testExampleDir(dirname),
      );
    }
  }
}
