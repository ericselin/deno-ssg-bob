import type {
  Builder,
  BuildOptions,
  ContentGetter,
  Location,
  Page,
  PagesGetter,
} from "../domain.ts";
import { ContentType } from "../domain.ts";
import { exists, expandGlob, path } from "../deps.ts";
import {
  createOutputFileWriter,
  createStaticFileWriter,
  readContentFile,
} from "./fs.ts";
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
) => (location: Location) => Promise<boolean>;

type ContentGetterCreator = (options: BuildOptions) => ContentGetter;

export type PageGetter = (
  location: Location,
) => Promise<Page | undefined>;

const createPagesGetter = (
  options: BuildOptions,
  getContent: ContentGetter,
): PagesGetter => {
  const processWalkEntry = getWalkEntryProcessor(options);
  const { log } = options;
  return async (glob) => {
    const contentGlob = path.join(options.contentDir, glob);
    log?.debug(`Getting pages with glob "${contentGlob}"`);
    const pages: Page[] = [];
    for await (const walkEntry of expandGlob(contentGlob)) {
      const content = await getContent(processWalkEntry(walkEntry));
      if (content?.type === ContentType.Page) {
        log?.debug(`Found page ${content.location.inputPath}`);
        pages.push(content);
      }
    }
    return pages;
  };
};

const createContentGetter: ContentGetterCreator = (options) => {
  const { buildDrafts } = options;
  const readFile = readContentFile(options);
  const parse = getParser(options);
  return (location) =>
    Promise
      .resolve(location)
      .then(readFile)
      .then((file) => {
        switch (file.type) {
          case ContentType.Page:
            return Promise
              .resolve(file)
              .then(parse)
              .then((page) =>
                // if page is a draft and not building drafts, return undefined
                // i.e. no page found
                (page.frontmatter?.draft && !buildDrafts) ? undefined : page
              );
          case ContentType.Static:
            return file;
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
  const writeOutputFile = createOutputFileWriter(options);
  const writeStaticFile = createStaticFileWriter(options);

  return (location) =>
    // run workflow
    Promise
      .resolve(location)
      .then(getContent)
      .then((content) =>
        // continue if page found, otherwise return false
        content?.type === ContentType.Page
          ? Promise.resolve(content)
            .then(loadLayout)
            .then(render)
            .then(writeOutputFile)
            .then(() => true)
          : content?.location.type === ContentType.Static
          ? Promise.resolve(content)
            .then(writeStaticFile)
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

  for await (const location of walkDirty(contentDir)) {
    try {
      const rendered = await process(location);

      if (rendered) {
        renderCount++;
      }
    } catch (e) {
      log?.error(`Error rendering page ${location.inputPath}!`);
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
