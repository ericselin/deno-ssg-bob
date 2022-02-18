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
  Logger,
  Page,
  PageContent,
  PagesGetter,
  StaticContent,
} from "../domain.ts";
import { ContentType } from "../domain.ts";
import { exists, expandGlob, md, path } from "../deps.ts";
import { FileCache } from "./cache.ts";
import {
  createDependantsReader,
  createDependencyPurger,
  createDependencyWriter,
  createNewDependantsGetter,
} from "./content-dependencies.ts";
import {
  cleanDirectory,
  createOutputFileWriter,
  createStaticFileWriter,
  readContentFile,
} from "./fs.ts";
import getParser, { stringifyPageContent } from "./parser.ts";
import render from "./renderer.ts";
import getLayoutLoader from "./layout-loader.ts";
import getWalkEntryProcessor from "./walk-entry-processor.ts";
import { createInputPathsGetter, sanitizeChangesFilter } from "./changes.ts";
import { getFilesystemChanges } from "./changes-fs.ts";

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
) => Promise<number>;
type ProcessorGetter = (options: BuildOptions) => Processor;

export const getProcessor: ProcessorGetter = (options) => {
  const getContent = createContentGetter(options);
  const pagesGetter = createPagesGetter(options, getContent);
  const writeOutputFile = createOutputFileWriter(options);
  const writeStaticFile = createStaticFileWriter(options);

  // run workflow
  const process: Processor = (location) => {
    const dependencyWriter = createDependencyWriter(
      options.cache,
      pagesGetter,
      options.contentDir,
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
            .then(() => dependencyWriter.write(content.location.inputPath))
            .then(() => 1)
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
const createChanger = (options: BuildOptions): Changer => {
  const { log } = options;
  const process = getProcessor(options);
  const getLocation = getWalkEntryProcessor(options);
  const getAllPossibleInputPaths = createInputPathsGetter(options);
  const purgeDependencies = createDependencyPurger(options.cache);
  return async (change) => {
    switch (change.type) {
      case "create":
      case "modify":
        return await process(getLocation({ path: change.inputPath }));
      case "delete":
        await purgeDependencies(change.inputPath).catch(() => {
          log?.debug(`No cached dependants for ${change.inputPath}`);
        });
        await Deno.remove(getLocation({ path: change.inputPath }).outputPath);
        return 1;
      case "orphan":
        await Promise.any(
          getAllPossibleInputPaths(change.outputPath).map((inputPath) =>
            purgeDependencies(inputPath)
          ),
        ).catch(() => {
          /* this should be a file not found, so just swallow */
          log?.debug(`No cached dependants found for ${change.outputPath}`);
        });
        await Deno.remove(change.outputPath);
        return 1;
    }
  };
};

type ChangesApplier = (changes: Change[]) => Promise<BuildResults>;
export const createChangesApplier = (options: BuildOptions): ChangesApplier => {
  const { log } = options;
  const applyChange = createChanger(options);
  const mapChangeToDependantChanges = createChangeToDependantChangesMapper(
    options,
  );
  return async (changes) => {
    log?.debug(`${changes.length} changes requested`);
    log?.info("Getting dependant pages that need to be re-rendered...");
    const allChanges =
      (await Promise.all(changes.map(mapChangeToDependantChanges)))
        .flat()
        .filter(sanitizeChangesFilter);
    log?.info(`Applying ${allChanges.length} changes in total including dependants...`);
    log?.debug(JSON.stringify(allChanges));
    const startTime = Date.now();
    for (const change of allChanges) {
      await applyChange(change);
    }
    const results = {
      renderCount: allChanges.length,
      durationMs: Date.now() - startTime,
    };
    log?.info(
      `Applied ${results.renderCount} changes in ${results.durationMs} ms`,
    );
    return results;
  };
};

const createChangeToDependantChangesMapper = (
  { log, contentDir, publicDir }: {
    log?: Logger;
    contentDir: string;
    publicDir: string;
  },
) => {
  const cache = new FileCache();
  const readDepandants = createDependantsReader(cache, log);
  const getNewDependants = createNewDependantsGetter(cache);
  const getAllPossibleInputPaths = createInputPathsGetter({
    contentDir,
    publicDir,
  });
  return async (change: Change): Promise<Change | Change[]> => {
    let dependants: string[];
    if (change.type === "create") {
      dependants = await getNewDependants(change.inputPath);
    } else if (change.type === "orphan") {
      const allPossibleInputPaths = getAllPossibleInputPaths(change.outputPath);
      dependants =
        (await Promise.all(allPossibleInputPaths.map(readDepandants))).flat();
    } else {
      dependants = await readDepandants(change.inputPath);
    }
    if (!dependants.length) return change;
    return [
      change,
      ...dependants.map((dep): Change => ({
        inputPath: dep,
        type: "modify",
      })),
    ];
  };
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

  log?.info("Getting list of changes from filesystem...");
  const changes = await getFilesystemChanges(options);
  log?.info(`Got ${changes.length} changes from filesystem`);
  const results = await createChangesApplier(options)(changes);

  return results;
};
