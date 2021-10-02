import { build } from "../mod.ts";
import { assertEquals, path, walk } from "../deps.ts";

const assertDirectoriesEqual = async (
  actualDir: string,
  expectedDir: string,
) => {
  for await (const dirEntry of walk(actualDir)) {
    if (!dirEntry.isFile) continue;
    const actualContents = await Deno.readTextFile(dirEntry.path);
    const relativePath = path.relative(actualDir, dirEntry.path);
    const expectedContents = await Deno.readTextFile(
      path.join(expectedDir, relativePath),
    );
    assertEquals(actualContents, expectedContents);
  }
};

const getPaths = (exampleDir: string) => {
  const thisDir = path.relative(
    Deno.cwd(),
    path.fromFileUrl(path.dirname(import.meta.url)),
  );
  return {
    contentDir: path.join(thisDir, exampleDir, "content"),
    rendererPath: path.join(thisDir, exampleDir, "site.ts"),
    expectedDir: path.join(thisDir, exampleDir, "expected"),
  };
};

const testExampleDir = (dir: string) =>
  async () => {
    const publicDir = await Deno.makeTempDir({ prefix: "bob-" });
    const paths = getPaths(dir);
    try {
      await build(
        paths.contentDir,
        paths.rendererPath,
        publicDir,
      );
      await assertDirectoriesEqual(publicDir, paths.expectedDir);
    } finally {
      await Deno.remove(publicDir, { recursive: true });
    }
  };

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
