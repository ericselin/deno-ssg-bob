// Public types for layout modules (TSX)

export type Component<
  P extends Props = DefaultProps,
  ContentFrontmatter = unknown,
  WantedPagesFrontmatter = undefined,
> =
  & ((
    props: P & { children?: Children },
    context: Context<ContentFrontmatter, WantedPagesFrontmatter>,
  ) => Awaitable<Element>)
  & {
    wantsPages?: WantsPages;
    needsCss?: NeedsCss;
  };

export type AnyComponent = Component<DefaultProps, unknown, unknown>;

export type Context<
  ContentFrontmatter = unknown,
  WantedPagesFrontmatter = unknown,
> = {
  page: ContentBase<ContentFrontmatter>;
  needsCss: CssSpecifier[];
  wantedPages?: WantedPagesFrontmatter extends undefined ? undefined
    : WantedPages<WantedPagesFrontmatter>;
};

export type ElementRendererCreator = (
  options?: BuildOptions,
  getPages?: PagesGetter,
) => (
  contentPage?: ContentUnknown,
) => ElementRenderer;

export type ElementRenderer = (
  element: Children | Promise<Children>,
) => Promise<string>;

export type ElementCreator = (
  type: ElementType,
  props?: Props,
  ...children: Children[]
) => Element;

export type Element<P extends Props = DefaultProps> = {
  type: ElementType;
  props?: P;
  children?: Children[];
  wantsPages?: WantsPages;
  needsCss?: NeedsCss;
};

export type Props = Record<string, unknown>;
export type DefaultProps = Props;

type ElementType = Component<DefaultProps, unknown, unknown> | string;

type Child = Element | string;
type Children = Child | Child[];

export type PagesGetter = (wantsPages: WantsPages) => Promise<ContentUnknown[]>;

export type WantsPages = string;
export type WantedPages<W = unknown> = ContentBase<W>[];

type CssSpecifier = string;
export type NeedsCss = CssSpecifier;

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
  baseUrl?: string;
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
  url: URL;
  dirty?: boolean;
};

// Filters

export type DirtyCheckerCreator = (options: BuildOptions) => DirtyChecker;
export type DirtyChecker = (filepath: FilePath) => Awaitable<boolean>;

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

export type RawFile = string;

// Parsers

export type Parser = (file: ContentFile) => ContentUnknown;

export type ContentUnknown = ContentBase<unknown>;

export type ContentBase<T> = {
  filepath: FilePath;
  frontmatter: T & {
    layout?: string;
  };
  content: Html;
};

export type Html = string;

// Layout file loading

export type LayoutLoader = (
  content: ContentUnknown,
) => Awaitable<RenderableContent>;

export type RenderableContent = {
  content: ContentUnknown;
  renderer: ContentRenderer;
};

export type ContentRenderer = (content: ContentUnknown) => Awaitable<Html>;

// Rendering

export type Renderer = (
  renderable: RenderableContent,
) => Awaitable<OutputFile>;

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
export type PageGetter = (filepath: FilePath) => Awaitable<ContentUnknown>;

export type AnyObject = Record<string, unknown>;
type Awaitable<T> = T | Promise<T>;
