import type { BuildOptions, Change, Logger } from "../domain.ts";
import { loadIfExists } from "../core/module-loader.ts";
import { fs, path, serve as listen } from "../deps.ts";
import { getChanger } from "../core/api.ts";
const FUNCTIONS_PATH = "functions/index.ts";

export type FunctionHandler = (
  req: Request,
  ctx: FunctionContext,
) => Response | Promise<Response>;

type FunctionContext = {
  pathnameParams: Record<string, string>;
  writeAndRender: ContentWriter;
};

type ContentWriter = (contentPath: string, content: string) => Promise<void>;

type FunctionDefinition = [string, FunctionHandler];
type FunctionDefinitions = FunctionDefinition[] | undefined;
type Functions = [URLPattern, FunctionHandler][];

type FunctionServerOptions = {
  log?: Logger;
  port?: number;
  buildOptions: BuildOptions;
};

const getContentWriter = (buildOptions: BuildOptions): ContentWriter => {
  const applyChange = getChanger(buildOptions);
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
    await applyChange(change);
  };
};

export const serve = async (options: FunctionServerOptions) => {
  const { log, port, buildOptions } = Object.assign(
    options,
    { port: 8081 } as FunctionServerOptions,
  );
  // load functions
  const functionDefinitions = (await loadIfExists(FUNCTIONS_PATH))
    ?.default as FunctionDefinitions;
  if (!functionDefinitions) {
    log?.info(`No server functions found ("${FUNCTIONS_PATH}")`);
    return;
  }
  // create url patterns
  const functions: Functions = functionDefinitions.map((
    [pathname, handler],
  ) => [new URLPattern({ pathname }), handler]);
  // create content writer
  const writeAndRender = getContentWriter(buildOptions);
  // start server
  listen((request) => {
    const fn = functions.find(([pattern]) => pattern.test(request.url));
    if (!fn) return new Response("Not found", { status: 404 });
    const [pattern, handler] = fn;
    const match = pattern.exec(request.url)!;
    return handler(request, { pathnameParams: match.pathname.groups, writeAndRender });
  }, { port });
  log?.info(`Functions running on port ${port}`);
};
