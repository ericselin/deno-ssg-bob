import type { BuildOptions, Change, Logger } from "../domain.ts";
import { Component, ContentType } from "../domain.ts";
import { loadIfExists } from "../core/module-loader.ts";
import { createRenderer, h } from "../core/jsx.ts";
import { fs, path, serve as listen } from "../deps.ts";
import {
  createChangesApplier,
  createContentReader,
  writeContent,
} from "../core/api.ts";
import { writeNginxLocations as writeNginxLocationsInternal } from "./nginx-locations.ts";
import { Cacher } from "./cache.ts";

const FUNCTIONS_PATH_DEPRECATED = "functions/index.ts";

export type FunctionHandler = (
  req: Request,
  ctx: FunctionContext,
) => Response | Promise<Response>;

type FunctionContext = {
  log?: Logger;
  pathnameParams: Record<string, string>;
  writeAndRender: ContentWriter;
  updateAndRender: ContentUpdater;
  renderResponse: <Props>(
    element: Component<Props>,
    props: Props extends undefined ? never : Props,
  ) => Promise<Response>;
};

type ContentWriter = (contentPath: string, content: string) => Promise<void>;
type ContentUpdater = (
  contentPath: string,
  frontmatter?: Record<string, unknown>,
  content?: string,
) => Promise<void>;

type FunctionDefinition = [string, FunctionHandler, FunctionOptions?];
export type FunctionOptions = {
  /** Cache GET requests to this function in the public folder */
  cache?: boolean;
};

export type Functions = FunctionDefinition[];
export type FunctionErrorHandler = (
  err: Error,
  req: Request,
) => Response | void | undefined | Promise<Response | void | undefined>;

type FunctionServerOptions = {
  responseCacher?: Cacher;
  functionDefinitions?: Functions;
  errorHandler?: FunctionErrorHandler;
  port?: number;
  buildOptions: BuildOptions;
};

type FunctionsPatterns = [URLPattern, FunctionHandler, FunctionOptions?][];

/** @deprecated */
export const writeNginxLocations = async (
  filepath: string,
  hostname: string,
  port: number,
  functions?: Functions,
  log?: Logger,
) => {
  // DEPRECATED
  if (!functions) {
    functions = (await loadIfExists(FUNCTIONS_PATH_DEPRECATED))
      ?.default as Functions;
    if (functions) {
      log?.warning("DEPRECATED: Using functions from functions/index.ts");
    }
  }
  if (!functions) {
    throw new Error("No functions defined");
  }
  await writeNginxLocationsInternal({
    filepath,
    hostname,
    port,
    functions: functions,
  });
};

export const loadFunctionsFromFunctionsFile = async (): Promise<
  Functions | undefined
> => {
  const functionDefinitions = (await loadIfExists(FUNCTIONS_PATH_DEPRECATED))
    ?.default as Functions;
  return functionDefinitions;
};

const getContentUpdater = (buildOptions: BuildOptions): ContentUpdater => {
  const readContent = createContentReader(buildOptions);
  const applyChange = createChangesApplier(buildOptions);
  return async (contentPath, frontmatterAssign, contentReplacement) => {
    if (contentReplacement !== undefined) {
      throw new Error("Not implemented");
    }
    const content = await readContent(contentPath);
    if (content?.type !== ContentType.Page) {
      throw new Error(`Content in ${contentPath} is not a page`);
    }
    if (content.content) {
      throw new Error("Not implemented");
    }
    const newContent = {
      ...content,
      frontmatter: {
        ...content.frontmatter,
        ...frontmatterAssign,
      },
    };
    await writeContent(newContent);
    await applyChange([{
      type: "modify",
      inputPath: newContent.location.inputPath,
    }]);
  };
};

const getContentWriter = (buildOptions: BuildOptions): ContentWriter => {
  const applyChange = createChangesApplier(buildOptions);
  return async (contentPath, content) => {
    // get content path
    const filepath = path.join(buildOptions.contentDir, contentPath);
    // ensure directory exists
    await fs.ensureDir(path.dirname(filepath));
    // write file
    await Deno.writeTextFile(filepath, content);
    // create change
    const change: Change = {
      type: "create",
      inputPath: filepath,
    };
    // apply change
    await applyChange([change]);
  };
};

export const handleRequest = (
  fnServerOptions: FunctionServerOptions,
) => {
  const { log } = fnServerOptions.buildOptions;

  if (!fnServerOptions.functionDefinitions) return;

  // create url patterns
  const functions: FunctionsPatterns = fnServerOptions.functionDefinitions.map((
    [pathname, handler, options],
  ) => [new URLPattern({ pathname }), handler, options]);

  // create content writer
  const writeAndRender = getContentWriter(fnServerOptions.buildOptions);
  const updateAndRender = getContentUpdater(fnServerOptions.buildOptions);

  return async (request: Request): Promise<Response> => {
    const fn = functions.find(([pattern]) => pattern.test(request.url));
    if (!fn) {
      return new Response("Not found", { status: 404 });
    }
    const [pattern, handler, options] = fn;
    const match = pattern.exec(request.url)!;
    const url = new URL(request.url);
    try {
      const response = await handler(request, {
        log,
        pathnameParams: match.pathname.groups,
        writeAndRender,
        updateAndRender,
        renderResponse: async (component, props) => {
          const renderer = createRenderer(fnServerOptions.buildOptions);
          const render = renderer({
            type: ContentType.Page,
            pathname: url.pathname,
            content: "",
            frontmatter: {},
            location: {
              type: ContentType.Page,
              inputPath: "",
              outputPath: "",
              contentPath: "",
              pathname: "",
              url: new URL("http://example.org/"),
            },
          });
          const element = h(component, props);
          const html = await render(element);
          return new Response(html, {
            headers: { "Content-Type": "text/html" },
          });
        },
      });
      if (options?.cache && fnServerOptions.responseCacher) {
        fnServerOptions.responseCacher(request, response);
      }
      return response;
    } catch (err) {
      log?.critical(err);
      const errorResponse = fnServerOptions.errorHandler &&
        await fnServerOptions.errorHandler(err, request);
      return errorResponse ||
        new Response("Internal server error", { status: 500 });
    }
  };
};

export const serve = (
  handle: (request: Request) => Response | Promise<Response>,
) => {
  listen(handle);
};
