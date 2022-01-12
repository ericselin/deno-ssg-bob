/*
Copyright 2021 Eric Selin

This file is part of `bob`.

`bob` is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

`bob` is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with `bob`. If not, see <https://www.gnu.org/licenses/>.

Please contact the developers via GitHub <https://www.github.com/ericselin>
or email eric.selin@gmail.com <mailto:eric.selin@gmail.com>
*/

import type {
  Builder,
  BuildOptions,
  Change,
  ContentGetter,
  Location,
  Page,
  PagesGetter,
} from "../domain.ts";
import { ContentType } from "../domain.ts";
import { exists, expandGlob, path } from "../deps.ts";
import { FileCache } from "./cache.ts";
import { createDependencyWriter } from "./content-dependencies.ts";
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
    let globArray = glob;
    if (typeof globArray === "string") globArray = [globArray];
    const pages: Page[] = [];
    for (const glob of globArray) {
      const contentGlob = path.join(options.contentDir, glob);
      log?.debug(`Getting pages with glob "${contentGlob}"`);
      for await (
        const walkEntry of expandGlob(contentGlob, { extended: true })
      ) {
        const content = await getContent(processWalkEntry(walkEntry));
        if (content?.type === ContentType.Page) {
          log?.debug(`Found page ${content.location.inputPath}`);
          pages.push(content);
        }
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

type Processor = (
  location: Location,
  processDependants?: boolean,
) => Promise<boolean>;
type ProcessorGetter = (options: BuildOptions) => Processor;

export const getProcessor: ProcessorGetter = (options) => {
  const getContent = createContentGetter(options);
  const pagesGetter = createPagesGetter(options, getContent);
  const writeOutputFile = createOutputFileWriter(options);
  const writeStaticFile = createStaticFileWriter(options);
  const cache = new FileCache();
  const getLocation = getWalkEntryProcessor(options);

  // run workflow
  const process: Processor = (location, processDependants = true) => {
    const dependencyWriter = createDependencyWriter(
      cache,
      pagesGetter,
      options.log,
    );
    const loadLayout = getLayoutLoader(options, dependencyWriter.getPages);
    return Promise
      .resolve(location)
      .then(getContent)
      .then((content) =>
        // continue if page found, otherwise return false
        content?.type === ContentType.Page
          ? Promise.resolve(content)
            .then(loadLayout)
            .then(render)
            .then(writeOutputFile)
            .then(() => dependencyWriter.write(content))
            .then(async () => {
              if (!processDependants) return;
              const deps = await dependencyWriter.getDependants(content);
              const locations = deps.map((path) => getLocation({ path }));
              options.log?.debug(
                `Building "${content.location.inputPath}" dependant pages ${
                  locations.join(", ")
                }`,
              );
              return Promise.all(
                locations.map((location) => process(location, false)),
              );
            })
            .then(() => true)
          : content?.location.type === ContentType.Static
          ? Promise.resolve(content)
            .then(writeStaticFile)
            .then(() => true)
          : false
      );
  };

  return process;
};

type Changer = (change: Change) => Promise<unknown>;
export const getUpdater = (options: BuildOptions): Changer => {
  const process = getProcessor(options);
  const getLocation = getWalkEntryProcessor(options);
  return async (change) => {
    const location = getLocation({ path: change.inputPath });
    await process(location);
  };
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
