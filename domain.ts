// Public types for layout modules (TSX)

export type Layout<P extends Props = Props, C = unknown> = Component<
  ContentBase<C> & P
>;
export type LayoutWantsPages<P extends Props = Props, C = unknown> =
  & Component<ContentBase<C> & P & { pages: string[] }>
  & {
    /** Array of globs relative to the current content page */
    wantsPages: WantsPages;
  };

export type Component<P extends Props = Props> = (
  props: P & { children?: Children },
) => Element | Promise<Element>;

export type ElementCreator = (
  type: Component | string | Promise<Component | string>,
  props?: Props,
  ...children: Children[]
) => Element;

export type ElementRenderer = (
  element: Children | Promise<Children>,
) => Promise<string>;

export type Element<P extends Props = Props> = {
  type: Component | string | Promise<Component | string>;
  props?: P;
  children?: Children[];
};

export type Props = Record<string, unknown>;

type Child = Element | string;
type Children = Child | Child[];

type WantsPages = string[];

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: unknown;
    }
  }
}

// External dependencies

import { Logger } from "./deps.ts";

// Builder

export type Builder = (options: BuildOptions) => Promise<BuildResults>;

export type BuildOptions = {
  contentDir: string;
  layoutDir: string;
  publicDir: string;
  force?: boolean;
  log?: Logger;
};

export type BuildResults = {
  durationMs: number;
  renderCount: number;
};

// File path processing

export type PathProcessor = (
  options: BuildOptions,
) => (path: string) => FilePath;

export type FilePath = {
  contentDir: string;
  relativePath: string;
  outputPath: string;
};

// Filters

export type Filter = (
  options: BuildOptions,
) => (filepath: FilePath) => Promise<boolean>;

// Content reading

export type FileReader = (
  options: BuildOptions,
) => (filepath: FilePath) => Promise<ContentFile>;

export type ContentFile = {
  filepath: FilePath;
  content: RawFile;
};

type RawFile = string;

// Parsers

export type Parser = (options: BuildOptions) => (file: File) => ContentUnknown;

export type ContentUnknown = ContentBase<unknown>;

export type ContentBase<T> = {
  filepath: FilePath;
  frontmatter: T;
  content: Html;
};

type Html = string;

// Rendering

export type Renderer = (
  options: BuildOptions,
) => (content: ContentUnknown) => Promise<OutputFile>;

export type OutputFile = {
  path: string;
  output: RawFile;
};

// Writing

export type FileWriter = (
  options: BuildOptions,
) => (file: OutputFile) => Promise<void>;
