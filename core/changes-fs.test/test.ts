import { assertArrayIncludes, assertEquals, path } from "../../deps.ts";
import {
  _createDeletedContentFilesChecker,
  _getDeletedContentFiles,
} from "../changes-fs.ts";

const testDir = path.dirname(path.fromFileUrl(import.meta.url));
const testDirRelative = path.relative(Deno.cwd(), testDir);

const getOpts = (
  suffix: string,
): { publicDir: string; contentDir: string } => ({
  contentDir: path.join(testDir, `content-${suffix}`),
  publicDir: path.join(testDir, `public-${suffix}`),
});

Deno.test("empty public folder returns empty orphan array", async () => {
  const orphans = await _getDeletedContentFiles(getOpts("1"));
  assertEquals(orphans, []);
});

Deno.test("empty content folder returns the one existing public file", async () => {
  const orphans = await _getDeletedContentFiles(getOpts("2"));
  assertEquals(
    orphans,
    [path.join(testDirRelative, "public-2", "orphan", "index.html")],
  );
});

Deno.test("deleted content file checker works", async () => {
  const isDeleted = _createDeletedContentFilesChecker(getOpts("3"));
  assertEquals(await isDeleted("orphan.html"), true);
  assertEquals(
    await isDeleted(path.join(testDir, "public-3", "orphan", "index.html")),
    true,
  );
});

Deno.test("all kinds of files in public folder works, index exists", async () => {
  const orphans = await _getDeletedContentFiles(getOpts("3"));
  assertArrayIncludes(
    orphans,
    [
      path.join(testDirRelative, "public-3", "subdir", "index.html"),
      path.join(testDirRelative, "public-3", "subdir", "another", "index.html"),
    ],
  );
});
