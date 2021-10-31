// Public types for layout modules (TSX)

export type Component<
  P extends Props = DefaultProps,
  PageFrontmatter = unknown,
  WantedPagesFrontmatter = undefined,
> =
  & ((
    props: P & { children?: Children },
    context: Context<PageFrontmatter, WantedPagesFrontmatter>,
  ) => Awaitable<Element>)
  & {
    wantsPages?: WantsPages;
    needsCss?: NeedsCss;
  };

export type AnyComponent = Component<DefaultProps, unknown, unknown>;

export type Context<
  PageFrontmatter = unknown,
  WantedPagesFrontmatter = unknown,
> = {
  page: Page<PageFrontmatter>;
  needsCss: CssSpecifier[];
  wantedPages?: WantedPagesFrontmatter extends undefined ? undefined
    : WantedPages<WantedPagesFrontmatter>;
};

export type ElementRendererCreator = (
  options?: BuildOptions,
  getPages?: PagesGetter,
) => (
  page?: Page,
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

export type PagesGetter = (wantsPages: WantsPages) => Promise<Page[]>;

export type WantsPages = string;
export type WantedPages<W = unknown> = Page<W>[];

type CssSpecifier = string;
export type NeedsCss = CssSpecifier;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: unknown;
    }
  }
}

// Main content types and getter

export type ContentGetter = (filePath: FilePath) => Awaitable<Content | undefined>;

export type Content = Page | StaticContent;

export type Page<T = unknown> = {
  type: ContentType.Page;
  filepath: FilePath;
  frontmatter: T & {
    layout?: string;
    draft?: boolean;
  };
  title?: string;
  date?: Date;
  summary?: string;
  content: Html;
};

export type StaticContent = {
  type: ContentType.Static;
  filepath: FilePath;
};

export enum ContentType {
  Page = "PAGE_CONTENT",
  Static = "STATIC_CONTENT",
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
  buildDrafts?: boolean;
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
) => (filepath: FilePath) => Promise<File>;

export type File = PageFile | StaticFile;

export type PageFile = {
  type: FileType.Page;
  filepath: FilePath;
  content: RawFile;
};

export type StaticFile = {
  type: FileType.Static;
  filepath: FilePath;
};

export enum FileType {
  Page = "PAGE_FILE",
  Static = "STATIC_FILE",
}

export type RawFile = string;

// Parsers

export type Parser = (file: PageFile) => Page;

export type Html = string;

// Layout file loading

export type LayoutLoader = (
  page: Page,
) => Awaitable<RenderablePage>;

export type RenderablePage = {
  page: Page;
  renderer: PageRenderer;
};

export type PageRenderer = (page: Page) => Awaitable<Html>;

// Rendering

export type Renderer = (
  renderable: RenderablePage,
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

export type AnyObject = Record<string, unknown>;
type Awaitable<T> = T | Promise<T>;
