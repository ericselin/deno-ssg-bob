/*
This file should include only top-level type declarations
*/

import type { Component } from "./core/jsx.ts";

export type Layout<P = unknown, C = unknown> = Component<ContentBase<C> & P>;

type WantsPages = string[];

export type LayoutWantsPages<P = unknown, C = unknown> = Component<ContentBase<C> & P & { pages: string[] }> & {
  /** Array of globs relative to the current content page */
  wantsPages: WantsPages;
};

export type ContentBase<T> = {
  filename: Filepath;
  frontmatter: T;
  content: Html;
};

export type ContentNone = ContentBase<unknown>;

export type ContentRenderer<T extends ContentNone> = (
  content: T,
) => string | Promise<string>;

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
