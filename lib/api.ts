import {
  parseContentFile,
  FrontmatterParser,
  ContentParser,
} from "../domain.ts";
import { Filepath, OutputFile, readContentFile, writeContentFile } from "./fs.ts";
import { yaml, md } from "../deps.ts";
import { log } from "./fn.ts";

export type Html = string;
export type Url = string;

export type ContentBase<T, t> = {
  filename: Filepath;
  type: t;
  frontmatter: T;
  content: Html;
};

type ContentNone = ContentBase<unknown, string>;

export type ContentRenderer<T extends ContentNone> = (content: T) => string;

const renderer = <T extends ContentNone>(baseLayout: ContentRenderer<T>) =>
  (content: T): OutputFile => ({
    filepath: content.filename.outputPath,
    output: baseLayout(content),
  });

const markdownParser = (str: string): Html => md.parse(str).content;

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

export default render;
