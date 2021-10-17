// Public types for layout modules (TSX)

export type Layout<P extends Props = Props, C = unknown> = Component<
  ContentBase<C> & P
>;

export type LayoutWantsPages<P extends Props = Props, C = unknown> =
  & Component<ContentBase<C> & P, WantedPages>
  & {
    /** Array of globs relative to the current content page */
    wantsPages: WantsPages;
  };

export type ElementRenderer = (
  element: Children | Promise<Children>,
) => Promise<string>;

export type ElementCreator = (
  type: ElementType,
  props?: Props,
  ...children: Children[]
) => Element;

export type Element<P extends Props = Props> = {
  type: ElementType;
  props?: P;
  children?: Children[];
  wantsPages?: WantsPages;
};

export interface Component<P extends Props = Props, W = undefined> {
  (props: P & { children?: Children }, pages?: W): Element | Promise<Element>;
  wantsPages?: WantsPages;
}

export type Props = Record<string, unknown>;

type ElementType = Component | string;

type Child = Element | string;
type Children = Child | Child[];

type WantsPages = string[];
type WantedPages = string[];

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: unknown;
    }
  }
}

// External dependencies

import type { Logger } from "./deps.ts";
export type { Logger };
import type { WalkEntry } from "./deps.ts";
export type { WalkEntry };

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

export type WalkEntryProcessor = (
  options: BuildOptions,
) => (walkEntry: WalkEntry) => FilePath;

export type FilePath = {
  contentDir: string;
  relativePath: string;
  outputPath: string;
  dirty?: boolean;
};

// Filters

export type DirtyCheckerCreator = (options: BuildOptions) => DirtyChecker;
export type DirtyChecker = (filepath: FilePath) => Promise<boolean>;

export type FileWalkerCreator = (
  dirtyCheckerCreators: DirtyCheckerCreator[],
) => (
  options: BuildOptions,
) => (dirpath: string) => AsyncGenerator<FilePath>;

export type FilePathGenerator = AsyncGenerator<FilePath>;

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

export type Parser = (file: ContentFile) => ContentUnknown;

export type ContentUnknown = ContentBase<unknown>;

export type ContentBase<T> = {
  filepath: FilePath;
  frontmatter: T;
  content: Html;
};

type Html = string;

// Layout file loading

export type LayoutLoader = (
  content: ContentUnknown,
) => MaybePromise<RenderableContent>;

export type RenderableContent = {
  content: ContentUnknown;
  renderer: ContentRenderer;
};

export type ContentRenderer = (content: ContentUnknown) => MaybePromise<Html>;

// Rendering

export type Renderer = (
  renderable: RenderableContent,
) => MaybePromise<OutputFile>;

export type OutputFile = {
  path: string;
  output: RawFile;
};

// Writing

export type FileWriter = (
  options: BuildOptions,
) => (file: OutputFile) => Promise<void>;

// Utilities

export type PageGetterCreator = (options: BuildOptions) => PageGetter;
export type PageGetter = (filepath: FilePath) => MaybePromise<ContentUnknown>;

type MaybePromise<T> = T | Promise<T>;
