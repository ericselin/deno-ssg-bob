import type {
  Builder,
  BuildOptions,
  ContentUnknown,
  FilePath,
  PageGetter,
  PageGetterCreator,
  PagesGetter,
} from "../domain.ts";
import { expandGlob } from "../deps.ts";
import { readContentFile, writeContentFile } from "./fs.ts";
import dirtyFileMod from "./dirty-file-mod/mod.ts";
import dirtyLayoutsChanged from "./dirty-layouts/mod.ts";
import parse from "./parser.ts";
import render from "./renderer.ts";
import createDirtyFileWalker from "./dirty-file-walk.ts";
import getLayoutLoader from "./layout-loader.ts";
import getWalkEntryProcessor from "./walk-entry-processor.ts";

type Processor = (
  options: BuildOptions,
) => (filepath: FilePath) => Promise<boolean>;

export const createPageGetter: PageGetterCreator = (options) => {
  const readFile = readContentFile(options);
  return (filepath) =>
    Promise
      .resolve(filepath)
      .then(readFile)
      .then(parse);
};

const createPagesGetter = (options: BuildOptions, getPage: PageGetter): PagesGetter => {
  const processWalkEntry = getWalkEntryProcessor(options);
  const { log } = options;
  return async (glob) => {
    const contentGlob = `content/${glob}`;
    log?.debug(`Getting pages with glob "${contentGlob}"`);
    const pages: ContentUnknown[] = [];
    for await (const walkEntry of expandGlob(contentGlob)) {
      const page = await getPage(processWalkEntry(walkEntry));
      log?.debug(`Found page ${page.filepath.relativePath}`);
      pages.push(page);
    }
    return pages;
  };
};

export const getProcessor: Processor = (options) => {
  const getPage = createPageGetter(options);
  const loadLayout = getLayoutLoader(options, createPagesGetter(options, getPage));

  return (walkEntry) =>
    // run workflow
    Promise
      .resolve(walkEntry)
      .then(getPage)
      .then(loadLayout)
      .then(render)
      .then(writeContentFile(options))
      .then(() => true);
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
