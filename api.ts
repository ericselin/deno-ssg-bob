import {
  readContentFiles,
  parseContentFile,
  FrontmatterParser,
  ContentParser,
  transformFilename,
} from "./domain.ts";
import { Filepath, DirectoryPath, OutputFile, writeContentFile } from "./fs.ts";
import { yaml, md } from "./deps.ts";

export type Html = string;
export type Url = string;

export type ContentBase<T, t> = {
  filename: Filepath;
  type: t;
  frontmatter: T;
  content: Html;
};

type ContentNone = ContentBase<any, string>;

export type ContentRenderer<T extends ContentNone> = (content: T) => string;

const renderer = <T extends ContentNone>(baseLayout: ContentRenderer<T>) =>
  (content: T): OutputFile => ({
    filepath: `public/${content.filename}`,
    output: baseLayout(content),
  });

const markdownParser = (str: string): Html => md.parse(str).content;

export const build = async <T extends ContentNone>(
  directories: DirectoryPath[],
  renderContent: ContentRenderer<T>,
  options?: {
    frontmatterParser: FrontmatterParser<T>;
    contentParser: ContentParser;
  },
): Promise<void> => {
  const opt: typeof options = Object.assign(
    {},
    options,
    {
      frontmatterParser: yaml.parse,
      contentParser: markdownParser,
    },
  );
  const parse = parseContentFile(
    opt.frontmatterParser,
    opt.contentParser,
  );
  const render = renderer(renderContent);

  const files = await readContentFiles(directories);
  files
    .map(parse)
    .map(render)
    .map(transformFilename)
    .map(writeContentFile);
};

export default build;
