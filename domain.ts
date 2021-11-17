/*
Copyright 2021 Eric Selin

This file is part of `bob`.

`bob` is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

`bob` is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with `bob`. If not, see <https://www.gnu.org/licenses/>.

Please contact the developers via GitHub <https://www.github.com/ericselin>
or email eric.selin@gmail.com <mailto:eric.selin@gmail.com>
*/

/*

TSX Components

*/

/** Component type to be used for all TSX components, both layouts and standalone. */
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

/** Context for rendering a specific page. */
export type Context<
  PageFrontmatter = unknown,
  WantedPagesFrontmatter = unknown,
> = {
  page: Page<PageFrontmatter>;
  needsCss: CssSpecifier[];
  wantedPages?: WantedPagesFrontmatter extends undefined ? undefined
    : WantedPages<WantedPagesFrontmatter>;
};

/** Component properties. */
export type Props = Record<string, unknown>;
/** Default component properties. */
export type DefaultProps = Props;

type WantsPages = string;
type WantedPages<W = unknown> = Page<W>[];

type CssSpecifier = string;
type NeedsCss = CssSpecifier;

/*

TSX rendering

*/

/** An `Element` is the internal representation of a `Component` or other node, such as a string. */
export type Element<P extends Props = DefaultProps> = {
  type: ElementType;
  props?: P;
  children?: Children[];
  wantsPages?: WantsPages;
  needsCss?: NeedsCss;
};

/** Creates elements from transpiled JSX calls. This is equivalent to `React.createElement` or `Preact.h`. */
export type ElementCreator = (
  type: ElementType,
  props?: Props,
  ...children: Children[]
) => Element;

/** Render an `Element` (usually the root element, of course) into an HTML string. */
export type ElementRenderer = (
  element: Children | Promise<Children>,
) => Promise<Html>;

/** Creates a renderer. */
export type ElementRendererCreator = (
  options: BuildOptions,
  getPages?: PagesGetter,
) => (
  page?: Page,
) => ElementRenderer;

/** Get an array of the pages wanted by a layout or a content page. */
export type PagesGetter = (wantsPages: WantsPages) => Promise<Page[]>;

type ElementType = Component<DefaultProps, unknown, unknown> | string;

type Child = Element | string;
type Children = Child | Child[];

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: unknown;
    }
  }
}

/*

Main types used throughout the workflow and in the public API.

*/

/** Options needed to build the site. */
export type BuildOptions = {
  contentDir: string;
  layoutDir: string;
  publicDir: string;
  buildDrafts?: boolean;
  force?: boolean;
  baseUrl?: string;
  log?: Logger;
};

/** Parsed representation of something in the `content` directory. */
export type Content = Page | StaticContent;

/** Something that should be rendered into an HTML page. */
export type Page<T = unknown> = {
  type: ContentType.Page;
  location: Location<ContentType.Page>;
  frontmatter: T & {
    layout?: string;
    draft?: boolean;
  };
  title?: string;
  date?: Date;
  summary?: string;
  content: Html;
};

/** Something that should just be copied to the `public` directory. */
export type StaticContent = {
  type: ContentType.Static;
  location: Location<ContentType.Static>;
};

/** Location of the content in different places. */
export type Location<T extends ContentType = ContentType> = {
  type: T;
  inputPath: CwdRelativePath;
  outputPath: CwdRelativePath;
  url: URL;
  dirty?: boolean;
};

/** Type of content in question. */
export enum ContentType {
  Page = "PAGE",
  Static = "STATIC",
  Unknown = "UNKNOWN",
}

/** Stats from the build. */
export type BuildResults = {
  durationMs: number;
  renderCount: number;
};

/** Read (but not parsed) representation of something in the `content` directory. */
export type File = PageFile | StaticFile;

/** File that should be parsed and rendered into HTML. */
export type PageFile = {
  type: ContentType.Page;
  location: Location<ContentType.Page>;
  content: RawFileString;
};

/** File that should be copied into the `public` directory. */
export type StaticFile = {
  type: ContentType.Static;
  location: Location<ContentType.Static>;
};

// Helper types

export type CwdRelativePath = string;
export type RawFileString = string;
export type Html = string;

/*

Workflow functions and specific types used in the main builder.

*/

/** Main `build` function. */
export type Builder = (options: BuildOptions) => Promise<BuildResults>;

/** Checks whether a content file should be considered "dirty", i.e. should be rendered. */
export type DirtyChecker = (location: Location) => Awaitable<boolean>;
/** Create a "dirty" checker. */
export type DirtyCheckerCreator = (options: BuildOptions) => DirtyChecker;

/** Create a file walker from an array of dirty checkers. */
export type FileWalkerCreator = (
  dirtyCheckerCreators: DirtyCheckerCreator[],
) => (
  options: BuildOptions,
) => (dirpath: string) => LocationGenerator;
export type LocationGenerator = AsyncGenerator<Location>;

/** Get `Location` from `WalkEntry` provided by directory walker. */
export type WalkEntryToLocationConverter = (
  options: BuildOptions,
) => (walkEntry: { path: string }) => Location;

/** Get content based on a particular location. */
export type ContentGetter = (
  location: Location,
) => Awaitable<Content | undefined>;

/** Read file specified by a `Location` into `File`. */
export type FileReader = (
  options: BuildOptions,
) => (location: Location) => Promise<File>;

/** Parse a page file into a page. */
export type Parser = (file: PageFile) => Page;

/** Load the layout `.tsx` file for a specific page based on lookup rules. */
export type LayoutLoader = (
  page: Page,
) => Awaitable<RenderablePage>;

/** Render page into something that can be written to disk (i.e. HTML string). */
export type Renderer = (
  renderable: RenderablePage,
) => Awaitable<OutputFile>;

/** Write page to disk. */
export type OutputFileWriterCreator = (
  options: BuildOptions,
) => (file: OutputFile) => Promise<void>;

/** Write static file to disk. */
export type StaticFileWriterCreator = (
  options: BuildOptions,
) => (staticContent: StaticContent) => Promise<void>;

// Helper types

export type RenderablePage = {
  page: Page;
  renderer: PageRenderer;
};
export type PageRenderer = (page: Page) => Awaitable<Html>;
export type OutputFile = {
  path: string;
  output: RawFileString;
};

/*

Helpers, utilities and other.

*/

// Cache provider

export type Cache = {
  get: <T>(key: string) => Promise<T>;
  put: <T>(key: string, value: T) => Promise<unknown>;
};

// Utility types

export type AnyObject = Record<string, unknown>;
type Awaitable<T> = T | Promise<T>;

// External dependencies

import type { Logger } from "./deps.ts";
export type { Logger };
import type { WalkEntry } from "./deps.ts";
export type { WalkEntry };
