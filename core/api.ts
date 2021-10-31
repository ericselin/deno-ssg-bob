import type {
  Builder,
  BuildOptions,
  ContentGetter,
  FilePath,
  Page,
  PagesGetter,
} from "../domain.ts";
import { ContentType, FileType } from "../domain.ts";
import { exists, expandGlob } from "../deps.ts";
import { readContentFile, writeContentFile } from "./fs.ts";
import dirtyFileMod from "./dirty-checkers/file-mod.ts";
import dirtyLayoutsChanged from "./dirty-checkers/layouts.ts";
import allDirtyOnForce from "./dirty-checkers/force-build.ts";
import getParser from "./parser.ts";
import render from "./renderer.ts";
import createDirtyFileWalker from "./dirty-file-walk.ts";
import getLayoutLoader from "./layout-loader.ts";
import getWalkEntryProcessor from "./walk-entry-processor.ts";

type Processor = (
  options: BuildOptions,
) => (filepath: FilePath) => Promise<boolean>;

type ContentGetterCreator = (options: BuildOptions) => ContentGetter;

export type PageGetter = (
  filepath: FilePath,
) => Promise<Page | undefined>;

const createPagesGetter = (
  options: BuildOptions,
  getContent: ContentGetter,
): PagesGetter => {
  const processWalkEntry = getWalkEntryProcessor(options);
  const { log } = options;
  return async (glob) => {
    const contentGlob = `content/${glob}`;
    log?.debug(`Getting pages with glob "${contentGlob}"`);
    const pages: Page[] = [];
    for await (const walkEntry of expandGlob(contentGlob)) {
      const page = await getContent(processWalkEntry(walkEntry));
      if (page?.type === ContentType.Page) {
        log?.debug(`Found page ${page.filepath.relativePath}`);
        pages.push(page);
      }
    }
    return pages;
  };
};

const createContentGetter: ContentGetterCreator = (options) => {
  const { buildDrafts } = options;
  const readFile = readContentFile(options);
  const parse = getParser(options);
  return (filePath) =>
    Promise
      .resolve(filePath)
      .then(readFile)
      .then((file) => {
        switch (file.type) {
          case FileType.Page:
            return Promise
              .resolve(file)
              .then(parse)
              .then((page) =>
                // if page is a draft and not building drafts, return undefined
                // i.e. no page found
                (page.frontmatter?.draft && !buildDrafts) ? undefined : page
              );
          default:
            return undefined;
        }
      });
};

export const getProcessor: Processor = (options) => {
  const getContent = createContentGetter(options);
  const loadLayout = getLayoutLoader(
    options,
    createPagesGetter(options, getContent),
  );

  return (filePath) =>
    // run workflow
    Promise
      .resolve(filePath)
      .then(getContent)
      .then((page) =>
        // continue if page found, otherwise return false
        page?.type === ContentType.Page
          ? Promise.resolve(page)
            .then(loadLayout)
            .then(render)
            .then(writeContentFile(options))
            .then(() => true)
          : false
      );
};

export const build: Builder = async (options) => {
  const startTime = Date.now();

  const { contentDir, layoutDir, publicDir, force, log } = options;

  log?.debug(
    `Build directories: content:${contentDir} layouts:${layoutDir} public:${publicDir}`,
  );

  if (!force) {
    log?.warning("Incremental builds are currently experimental");
    log?.warning("Use `-f` CLI flag to force build everything");
  }

  if (force && await exists(publicDir)) {
    log?.warning(`Cleaning public directory ${publicDir}`);
    await Deno.remove(publicDir, { recursive: true });
  }

  const walkDirty = createDirtyFileWalker([
    allDirtyOnForce,
    dirtyLayoutsChanged,
    dirtyFileMod,
  ])(
    options,
  );
  const process = getProcessor(options);

  let renderCount = 0;

  for await (const filepath of walkDirty(contentDir)) {
    try {
      const rendered = await process(filepath);

      if (rendered) {
        renderCount++;
      }
    } catch (e) {
      log?.error(`Error rendering page ${filepath.relativePath}!`);
      throw e;
    }
  }

  const results = {
    durationMs: Date.now() - startTime,
    renderCount,
  };

  log?.info(`Built ${results.renderCount} pages in ${results.durationMs} ms`);

  return results;
};
