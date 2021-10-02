import { path } from "./deps.ts";
import { render, filterFileMod } from "./mod.ts";
import { listDirectories } from "./domain.ts";

const base = await import(path.join(Deno.cwd(), "site.ts"));

const filepaths = await listDirectories(["content"]);

for (const filepath of filepaths) {
  if (await filterFileMod(filepath)) {
    await render(filepath, base.default);
  }
}
