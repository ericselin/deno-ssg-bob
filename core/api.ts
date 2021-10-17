import type { Builder, BuildOptions, WalkEntry } from "../domain.ts";
import { readContentFile, writeContentFile } from "./fs.ts";
import { shouldRender as filterFileMod } from "./filter-file-mod/mod.ts";
import { dependenciesChanged } from "./filter-renderer-deps/mod.ts";
import getWalkEntryProcessor from "./walk-entry-processor.ts";
import parse from "./parser.ts";
import render from "./renderer.ts";
import combineFilters from "./combine-filters.ts";
import getLayoutLoader from "./layout-loader.ts";
import walkFiles from "./walker.ts";

type Processor = (
  options: BuildOptions,
) => (walkEntry: WalkEntry) => Promise<boolean>;

export const getProcessor: Processor = (options) => {
  const processWalkEntry = getWalkEntryProcessor(options);
  const readFile = readContentFile(options);
  const filter = combineFilters([filterFileMod])(options);
  const throwIfUndefined = (msg: string) =>
    <T>(v: T | undefined) => {
      if (!v) throw new Error(msg);
      else return v;
    };
  const loadLayout = getLayoutLoader(options);

  return (walkEntry) =>
    // run workflow
    Promise
      .resolve(walkEntry)
      .then(processWalkEntry)
      .then(filter)
      .then(throwIfUndefined("This file was filtered"))
      .then(readFile)
      .then(parse)
      .then(loadLayout)
      .then(render)
      .then(writeContentFile(options))
      .then(() => true)
      .catch((e) => {
        if (e.message !== "This file was filtered") {
          throw e;
        }
        return false;
      });
};

export const build: Builder = async (options) => {
  const startTime = Date.now();

  const { contentDir, layoutDir, publicDir, force, log } = options;

  log?.debug(
    `Build directories: content:${contentDir} layouts:${layoutDir} public:${publicDir}`,
  );

  const layoutChanged = await dependenciesChanged(layoutDir, publicDir);

  layoutChanged && log?.warning("Layout files changed, rebuilding everything");

  if (force) {
    log?.warning(`Force building and cleaning public directory ${publicDir}`);
    await Deno.remove(publicDir, { recursive: true });
  }

  const process = getProcessor(options);

  let renderCount = 0;

  for await (const walkEntry of walkFiles(contentDir)) {
    const rendered = await process(walkEntry);

    if (rendered) {
      renderCount++;
    }
  }

  return {
    durationMs: Date.now() - startTime,
    renderCount,
  };
};
