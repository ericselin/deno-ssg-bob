import {
  readContentFiles,
  parseContentFile,
  writeContentFile,
  OutputFile,
  FrontmatterParser,
  ContentParser,
  transformFilename,
} from "./domain.ts";

export type Html = string;
export type DirectoryPath = string;
export type Filepath = string;
export type Url = string;

export type ContentBase<T, t> = {
  filename: Filepath;
  type?: t;
  url?: Url;
  frontmatter: T;
  content: Html;
};

type ContentNone = ContentBase<any, string>;

export type ContentRenderer<T extends ContentNone> = (content: T) => string;

const renderer = <T extends ContentNone>(baseLayout: ContentRenderer<T>) =>
  (content: T): OutputFile => ({
    filepath: `public/${content.filename}`,
    content: baseLayout(content),
  });

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
      frontmatterParser: (str: string) => str ? JSON.parse(str) : "",
      contentParser: (str: string) => str ? str.toUpperCase() : "",
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
