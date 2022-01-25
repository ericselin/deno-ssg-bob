import type { BuildOptions, Change, Logger } from "../domain.ts";
import { ContentType } from "../domain.ts";
import { loadIfExists } from "../core/module-loader.ts";
import { fs, path, serve as listen } from "../deps.ts";
import {
  createChangesApplier,
  createContentReader,
  writeContent,
} from "../core/api.ts";
import { writeNginxLocations as writeNginxLocationsInternal } from "./nginx-locations.ts";
const FUNCTIONS_PATH = "functions/index.ts";

export const writeNginxLocations = async (
  filepath: string,
  hostname: string,
  port: number,
) => {
  const functionDefinitions = (await loadIfExists(FUNCTIONS_PATH))
    ?.default as Functions;
  if (!functionDefinitions) {
    throw new Error(`Functions not found at ${FUNCTIONS_PATH}`);
  }
  await writeNginxLocationsInternal({
    filepath,
    hostname,
    port,
    functions: functionDefinitions,
  });
};

export type FunctionHandler = (
  req: Request,
  ctx: FunctionContext,
) => Response | Promise<Response>;

type FunctionContext = {
  pathnameParams: Record<string, string>;
  writeAndRender: ContentWriter;
  updateAndRender: ContentUpdater;
};

type ContentWriter = (contentPath: string, content: string) => Promise<void>;
type ContentUpdater = (
  contentPath: string,
  frontmatter?: Record<string, unknown>,
  content?: string,
) => Promise<void>;

type FunctionDefinition = [string, FunctionHandler];
export type Functions = FunctionDefinition[];
type FunctionsPatterns = [URLPattern, FunctionHandler][];

type FunctionServerOptions = {
  log?: Logger;
  port?: number;
  buildOptions: BuildOptions;
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
      type: "modify",
      inputPath: filepath,
    };
    // apply change
    await applyChange([change]);
  };
};

export const serve = async (options: FunctionServerOptions) => {
  const { log, port, buildOptions } = Object.assign(
    options,
    { port: 8081 } as FunctionServerOptions,
  );
  // load functions
  const functionDefinitions = (await loadIfExists(FUNCTIONS_PATH))
    ?.default as Functions;
  if (!functionDefinitions) {
    log?.info(`No server functions found ("${FUNCTIONS_PATH}")`);
    return;
  }
  // create url patterns
  const functions: FunctionsPatterns = functionDefinitions.map((
    [pathname, handler],
  ) => [new URLPattern({ pathname }), handler]);
  // create content writer
  const writeAndRender = getContentWriter(buildOptions);
  const updateAndRender = getContentUpdater(buildOptions);
  // start server
  listen((request) => {
    const fn = functions.find(([pattern]) => pattern.test(request.url));
    if (!fn) return new Response("Not found", { status: 404 });
    const [pattern, handler] = fn;
    const match = pattern.exec(request.url)!;
    try {
      return handler(request, {
        pathnameParams: match.pathname.groups,
        writeAndRender,
        updateAndRender,
      });
    } catch (err) {
      log?.error(err.toString());
      return new Response("Internal server error", { status: 500 });
    }
  }, { port });
  log?.info(`Functions running on port ${port}`);
};
