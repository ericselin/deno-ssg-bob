import type {
  Builder,
  BuildOptions,
  FilePath,
  PageGetterCreator,
} from "../domain.ts";
import { readContentFile, writeContentFile } from "./fs.ts";
import dirtyFileMod from "./dirty-file-mod/mod.ts";
import dirtyLayoutsChanged from "./dirty-layouts/mod.ts";
import parse from "./parser.ts";
import render from "./renderer.ts";
import createDirtyFileWalker from "./dirty-file-walk.ts";
import getLayoutLoader from "./layout-loader.ts";

type Processor = (
  options: BuildOptions,
) => (filepath: FilePath) => Promise<boolean>;

export const createPageGetter: PageGetterCreator = (options) => {
  const readFile = readContentFile(options);
  return (walkEntry) =>
    Promise
      .resolve(walkEntry)
      .then(readFile)
      .then(parse);
};

export const getProcessor: Processor = (options) => {
  const getPage = createPageGetter(options);
  const loadLayout = getLayoutLoader(options);

  return (walkEntry) =>
    // run workflow
    Promise
      .resolve(walkEntry)
      .then(getPage)
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

  if (force) {
    log?.warning(`Cleaning public directory ${publicDir} and force building`);
    await Deno.remove(publicDir, { recursive: true });
  }

  const walkDirty = createDirtyFileWalker([dirtyLayoutsChanged, dirtyFileMod])(
    options,
  );
  const process = getProcessor(options);

  let renderCount = 0;

  for await (const filepath of walkDirty(contentDir)) {
    const rendered = await process(filepath);

    if (rendered) {
      renderCount++;
    }
  }

  return {
    durationMs: Date.now() - startTime,
    renderCount,
  };
};
