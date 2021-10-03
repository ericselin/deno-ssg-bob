/*
This file should include only top-level type declarations
*/
import type { FunctionComponent } from "https://x.lcas.dev/preact@10.5.12/mod.js";

export type ContentBase<T, t> = {
  filename: Filepath;
  type: t;
  frontmatter: T;
  content: Html;
};

export type ContentNone = ContentBase<unknown, unknown>;

export type ContentRenderer<T extends ContentNone> = (content: T) => string;

export type Component<P = unknown> = FunctionComponent<ContentNone & P>;

export type Html = string;
export type RawFile = string;
export type RawFrontmatter = string;
export type RawContent = string;

export type Filepath = {
  contentDir: string;
  relativePath: string;
  outputPath: string;
};

export type FrontmatterParser<T> = (
  frontmatter: RawFrontmatter,
) => T;
export type ContentParser = (content: RawContent) => Html;

