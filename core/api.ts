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
  BuildResults,
  Change,
  ContentGetter,
  Location,
  Page,
  PageContent,
  PagesGetter,
  StaticContent,
} from "../domain.ts";
import { ContentType } from "../domain.ts";
import { exists, expandGlob, md, path } from "../deps.ts";
import { FileCache } from "./cache.ts";
import { createDependencyWriter } from "./content-dependencies.ts";
import {
  cleanDirectory,
  createOutputFileWriter,
  createStaticFileWriter,
  readContentFile,
} from "./fs.ts";
import dirtyFileMod from "./dirty-checkers/file-mod.ts";
import dirtyLayoutsChanged from "./dirty-checkers/layouts.ts";
import allDirtyOnForce from "./dirty-checkers/force-build.ts";
import getParser, { stringifyPageContent } from "./parser.ts";
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

/** Path to content file. If it starts with a slash, it's considered relative to the
 * root directory, if not it's considered relative to the content directory */
type ContentFilePath = string;

export const createContentReader = (
  options: BuildOptions,
) => {
  const contentFilePathToLocation = createContentFilePathToLocation(options);
  return (filepath: string): Promise<StaticContent | PageContent | undefined> =>
    Promise
      .resolve(filepath)
      .then(contentFilePathToLocation)
      .then(async (location) =>
        location.type === ContentType.Static
          ? staticLocationToContent(location as Location<ContentType.Static>)
          : location.type === ContentType.Page
          ? await readPageLocation(location as Location<ContentType.Page>)
          : undefined
      );
};

const createContentFilePathToLocation = (options: BuildOptions) => {
  const inputPathToLocation = getWalkEntryProcessor(options);
  return (filepath: ContentFilePath): Location => {
    // add content dir if not starting with slash
    if (!filepath.startsWith("/")) {
      filepath = path.join(options.contentDir, filepath);
    } // remove extra beginning slash otherwise
    else filepath = filepath.substring(1);
    return inputPathToLocation({ path: filepath });
  };
};
const staticLocationToContent = (
  staticLocation: Location<ContentType.Static>,
): StaticContent => ({
  type: ContentType.Static,
  location: staticLocation,
});

const readPageLocation = (
  pageLocation: Location<ContentType.Page>,
): Promise<PageContent> =>
  Promise
    .resolve(pageLocation)
    .then(async (location) => ({
      type: ContentType.Page,
      location,
      rawContent: await Deno.readTextFile(location.inputPath),
    }))
    .then(({ rawContent, ...page }) => {
      const parsed = md.parse(rawContent);
      return ({
        ...page,
        type: ContentType.Page,
        frontmatter: parsed.meta,
        content: parsed.content,
      });
    });

export const writeContent = (
  content: { location: Location; frontmatter: Record<string, unknown> },
): Promise<void> =>
  Deno.writeTextFile(
    content.location.inputPath,
    stringifyPageContent({ frontmatter: content.frontmatter }),
  );

export const createContentGetter: ContentGetterCreator = (options) => {
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
) => Promise<number>;
type ProcessorGetter = (options: BuildOptions) => Processor;

export const getProcessor: ProcessorGetter = (options) => {
  const getContent = createContentGetter(options);
  const pagesGetter = createPagesGetter(options, getContent);
  const writeOutputFile = createOutputFileWriter(options);
  const writeStaticFile = createStaticFileWriter(options);
  const cache = new FileCache();
  const getLocation = getWalkEntryProcessor(options);

  // run workflow
  const process: Processor = (location, processDependants = false) => {
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
              if (!processDependants) return 1;
              const deps = await dependencyWriter.getDependants(content);
              const locations = deps.map((path) => getLocation({ path }));
              options.log?.debug(
                `Building "${content.location.inputPath}" dependant pages ${
                  locations.join(", ")
                }`,
              );
              return await locations.reduce(
                async (previousCountPromise, location) => {
                  const count = await previousCountPromise;
                  return count + await process(location, false);
                },
                Promise.resolve(1),
              );
            })
          : content?.location.type === ContentType.Static
          ? Promise.resolve(content)
            .then(writeStaticFile)
            .then(() => 1)
          : 0
      );
  };

  return process;
};

type Changer = (change: Change) => Promise<number>;
export const getChanger = (options: BuildOptions): Changer => {
  const { log } = options;
  const process = getProcessor(options);
  const getLocation = getWalkEntryProcessor(options);
  return async (change) => {
    if (change.type === "create" || change.type === "modify") {
      const location = getLocation({ path: change.inputPath });
      return await process(location);
    }
    log?.warning(`Cannot process change ${JSON.stringify(change)}`);
    return 0;
  };
};

type ChangesApplier = (changes: Change[]) => Promise<BuildResults>;
export const getChangesApplier = (options: BuildOptions): ChangesApplier => {
  const { log } = options;
  const applyChange = getChanger(options);
  return async (changes) => {
    let renderCount = 0;
    const startTime = Date.now();
    for (const change of changes) {
      renderCount += await applyChange(change);
    }
    const results = { renderCount, durationMs: Date.now() - startTime };
    log?.info(`Built ${results.renderCount} pages in ${results.durationMs} ms`);
    return results;
  };
};

const getFilesystemChanges = async (
  options: BuildOptions,
): Promise<Change[]> => {
  const { log } = options;

  const walkDirty = createDirtyFileWalker([
    allDirtyOnForce,
    dirtyLayoutsChanged,
    dirtyFileMod,
  ])(
    options,
  );

  const changes: Change[] = [];

  log?.debug("Getting file system -based changes...");
  const startTime = Date.now();

  for await (const location of walkDirty()) {
    try {
      changes.push({ type: "modify", inputPath: location.inputPath });
    } catch (e) {
      log?.error(`Error rendering page ${location.inputPath}!`);
      throw e;
    }
  }

  log?.debug(`Got changes in ${Date.now() - startTime} ms`);

  return changes;
};

export const build: Builder = async (options) => {
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
    await cleanDirectory(publicDir);
  }

  const changes = await getFilesystemChanges(options);
  const results = await getChangesApplier(options)(changes);

  log?.info(`Built ${results.renderCount} pages in ${results.durationMs} ms`);

  return results;
};
