import type {
  ContentBase,
  ContentNone,
  ContentParser,
  ContentRenderer,
  Filepath,
  FrontmatterParser,
} from "../domain.ts";
import {
  ContentFile,
  listDirectory,
  OutputFile,
  readContentFile,
  writeContentFile,
} from "./fs.ts";
import { shouldRender as filterFileMod } from "./filter-file-mod/mod.ts";
import { dependenciesChanged } from "./filter-renderer-deps/mod.ts";
import { Logger, md, path, yaml } from "../deps.ts";
import { Component, h, render as renderJsx } from "./jsx.ts";

export type Html = string;
export type Url = string;

const renderer = <T extends ContentNone>(baseLayout: ContentRenderer<T>) =>
  async (content: T): Promise<OutputFile> => ({
    filepath: content.filename.outputPath,
    output: await baseLayout(content),
  });

const markdownParser = (str: string): Html => md.parse(str).content;

export const parseContentFile = <T extends ContentBase<unknown, unknown>>(
  parseFrontmatter: FrontmatterParser<T>,
  parseContent: ContentParser,
) =>
  (contentFile: ContentFile): T => {
    const contentSplit = contentFile.content.split("\n---\n");
    const rawContent = contentSplit.pop() || "";
    const rawFrontmatter = contentSplit.pop() || "";
    const frontmatter = parseFrontmatter(rawFrontmatter);
    return {
      filename: contentFile.filepath,
      type: frontmatter?.type,
      frontmatter,
      content: parseContent(rawContent),
    } as T;
  };

export const render = async <T extends ContentNone>(
  filepath: Filepath,
  renderContent: ContentRenderer<T>,
  options?: {
    frontmatterParser: FrontmatterParser<T>;
    contentParser: ContentParser;
  },
): Promise<void> => {
  // set up options
  const opt: typeof options = Object.assign(
    {},
    options,
    <typeof options> {
      frontmatterParser: yaml.parse,
      contentParser: markdownParser,
    },
  );

  // set up functions
  const parse = parseContentFile(
    opt.frontmatterParser,
    opt.contentParser,
  );
  const render = renderer(renderContent);

  // run workflow
  await Promise
    .resolve(filepath)
    .then(readContentFile)
    .then(parse)
    .then(render)
    .then(writeContentFile);
};

type BuildOptions = {
  contentDir: string;
  layoutDir: string;
  publicDir: string;
  force?: boolean;
  log?: Logger;
};

const loadIfExists = async (scriptPath: string) => {
  try {
    const module = await import(path.join(Deno.cwd(), scriptPath));
    return module;
  } catch (_e) {
    return undefined;
  }
};

type LayoutModule<t, T> = {
  module: {
    default: T;
  };
  type: t;
  path: string;
};
type LayoutModuleTsx = LayoutModule<"tsx", Component | Promise<Component>>;
type LayoutModuleFn = LayoutModule<"ts", ContentRenderer<ContentNone>>;
type LayoutModuleUnknown = LayoutModule<"unknown", unknown>;

const loadFirstLayout = async (
  scriptPaths: string[],
): Promise<
  LayoutModuleTsx | LayoutModuleFn | LayoutModuleUnknown | undefined
> => {
  if (!scriptPaths.length) return undefined;
  const currentPath = scriptPaths[0];
  const module = await loadIfExists(currentPath);
  if (!module) return loadFirstLayout(scriptPaths.slice(1));
  const props = { module, path: currentPath };
  switch (path.extname(currentPath)) {
    case ".tsx":
      return { ...props, type: "tsx" };
    case ".ts":
      return { ...props, type: "ts" };
    default:
      return { ...props, type: "unknown" };
  }
};

const findLayout = async (
  contentPath: string,
  layoutDir: string,
  log?: Logger,
): Promise<ContentRenderer<ContentNone> | undefined> => {
  let renderToString: ContentRenderer<ContentNone>;

  const jsxPath = contentPath.replace(/\.\w+$/, ".tsx");
  const jsPath = contentPath.replace(/\.\w+$/, ".js");

  const lookup = [
    path.join(layoutDir, jsxPath),
    path.join(layoutDir, "_default.tsx"),
    path.join(layoutDir, jsPath),
    path.join(layoutDir, "_default.ts"),
  ];

  log?.debug(`Searching for layout for ${contentPath} in [
    ${lookup.join("\n    ")}\n  ]`);

  const layout = await loadFirstLayout(lookup);
  if (!layout) {
    log?.warning(`Could not find layout for ${contentPath}`);
    return undefined;
  }

  if (layout.type === "tsx") {
    log?.debug(`Rendering layout file '${layout.path}' as TSX`);
    renderToString = async (content) =>
      await renderJsx(h(layout.module.default, content));
  } else if (layout.type === "ts") {
    log?.debug(`Rendering layout file '${layout.path}' as function`);
    renderToString = layout.module.default;
  } else {
    log?.warning(`Unknown layout type '${layout.path}'`);
    return undefined;
  }
  return renderToString;
};

export const build = async (options: BuildOptions) => {
  const { contentDir, layoutDir, publicDir, force, log } = options;

  log?.debug(
    `Build directories: content:${contentDir} layouts:${layoutDir} public:${publicDir}`,
  );

  const filepaths = await listDirectory(contentDir, publicDir);

  const layoutChanged = await dependenciesChanged(layoutDir, publicDir);
  layoutChanged && log?.warning("Layout files changed, rebuilding everything");

  if (force) {
    log?.warning(`Force building and cleaning public directory ${publicDir}`);
    await Deno.remove(publicDir, { recursive: true });
  }

  let renderCount = 0;

  for (const filepath of filepaths) {
    if (layoutChanged || await filterFileMod(filepath)) {
      const renderToString = await findLayout(
        filepath.relativePath,
        layoutDir,
        log,
      );
      if (!renderToString) continue;
      log?.info(`Rendering content file '${filepath.relativePath}' to disk`);
      await render(filepath, renderToString);
      renderCount++;
    } else {
      log && log.debug(`Content file '${filepath.relativePath}' unchanged`);
    }
  }

  if (!renderCount) log?.info("Everything up to date, nothing rendered");
};
