import { build } from "../mod.ts";
import { assertEquals, path, walk } from "../deps.ts";

const assertDirectoriesEqual = async (
  actualDir: string,
  expectedDir: string,
) => {
  for await (const dirEntry of walk(actualDir)) {
    if (!dirEntry.isFile) continue;
    const actualContents = await Deno.readTextFile(dirEntry.path);
    const expectedContents = await Deno.readTextFile(
      path.join(expectedDir, dirEntry.name),
    );
    assertEquals(actualContents, expectedContents);
  }
};

const getPaths = (exampleDir: string) => {
  const thisDir = path.relative(
    Deno.cwd(),
    path.fromFileUrl(path.dirname(import.meta.url)),
  );
  console.log("this dir", thisDir);
  return {
    contentDir: path.join(thisDir, exampleDir, "content"),
    rendererPath: path.join(thisDir, exampleDir, "site.ts"),
    expectedDir: path.join(thisDir, exampleDir, "expected"),
  };
};

Deno.test("simple site builds", async () => {
  const publicDir = await Deno.makeTempDir({ prefix: "bob-" });
  const paths = getPaths("simple");
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
});
