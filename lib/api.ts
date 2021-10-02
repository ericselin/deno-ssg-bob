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
  listDirectories,
  OutputFile,
  readContentFile,
  writeContentFile,
} from "./fs.ts";
import { shouldRender as filterFileMod } from "./filter-file-mod/mod.ts";
import { md, yaml, path } from "../deps.ts";
import { log } from "./fn.ts";

export type Html = string;
export type Url = string;

const renderer = <T extends ContentNone>(baseLayout: ContentRenderer<T>) =>
  (content: T): OutputFile => ({
    filepath: content.filename.outputPath,
    output: baseLayout(content),
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
    .then(log("Rendering content to disk:"))
    .then(readContentFile)
    .then(parse)
    .then(render)
    .then(writeContentFile)
    .then(log("Done!", false));
};

export const build = async (
  directories: string[],
  rendererPath: string,
) => {
  const { default: base } = await import(path.join(Deno.cwd(), rendererPath));

  const filepaths = await listDirectories(directories);

  for (const filepath of filepaths) {
    if (await filterFileMod(filepath)) {
      await render(filepath, base);
    }
  }
};
