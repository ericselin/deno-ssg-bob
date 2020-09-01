import {
  readContentFiles,
  parseContentFile,
  writeContentFile,
  OutputFile,
  FrontmatterParser,
  ContentParser,
} from "./domain.ts";

export type Html = string;
export type DirectoryPath = string;
export type Filename = string;
export type Url = string;

export type ContentBase<T, t> = {
  filename: Filename;
  type?: t;
  url?: Url;
  frontmatter: T;
  content: Html;
};

type ContentNone = ContentBase<any, string>;

export type ContentRenderer<T extends ContentNone> = (content: T) => string;

const renderer = <T extends ContentNone>(baseLayout: ContentRenderer<T>) =>
  (content: T): OutputFile => ({
    filename: `public/${content.filename}`,
    content: baseLayout(content),
  });

const build = async <T extends ContentNone>(
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
    .map(writeContentFile);
};

export default build;
