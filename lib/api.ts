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
import { h, render as renderJsx } from "./jsx.ts";

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

export const build = async (
  directory: string,
  rendererPath: string,
  publicDir: string,
  log?: Logger,
) => {
  let renderToString: ContentRenderer<ContentNone>;

  const { default: layout } = await import(path.join(Deno.cwd(), rendererPath));

  if (path.extname(rendererPath) === ".tsx") {
    log && log.debug(`Rendering layout file '${rendererPath}' as TSX`);
    renderToString = async (content) => await renderJsx(h(layout, content));
  } else {
    log && log.debug(`Rendering layout file '${rendererPath}' as function`);
    renderToString = layout;
  }

  const filepaths = await listDirectory(directory, publicDir);

  const layoutChanged = await dependenciesChanged(rendererPath, publicDir);
  layoutChanged && log &&
    log.warning("Layout files changed, rebuilding everything");

  for (const filepath of filepaths) {
    if (layoutChanged || await filterFileMod(filepath)) {
      log &&
        log.info(`Rendering content file '${filepath.relativePath}' to disk`);
      await render(filepath, renderToString);
    } else {
      log && log.debug(`Content file '${filepath.relativePath}' unchanged`);
    }
  }
};
