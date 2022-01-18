import type { Logger } from "../domain.ts";
import { loadIfExists } from "../core/module-loader.ts";
import { serve as listen } from "../deps.ts";
const FUNCTIONS_PATH = "functions/index.ts";

export type FunctionHandler = (
  req: Request,
  ctx: FunctionContext,
) => Response | Promise<Response>;
type FunctionContext = {
  pathnameParams: Record<string, string>;
};
type FunctionDefinition = [string, FunctionHandler];
type FunctionDefinitions = FunctionDefinition[] | undefined;
type Functions = [URLPattern, FunctionHandler][];

type FunctionServerOptions = {
  log?: Logger;
  port?: number;
};

export const serve = async (options: FunctionServerOptions) => {
  const { log, port } = Object.assign(options, { port: 8081 } as FunctionServerOptions);
  // load functions
  const functionDefinitions = (await loadIfExists(FUNCTIONS_PATH))
    .default as FunctionDefinitions;
  if (!functionDefinitions) {
    log?.info(`No server functions found ("${FUNCTIONS_PATH}")`);
    return;
  }
  // create url patterns
  const functions: Functions = functionDefinitions.map((
    [pathname, handler],
  ) => [new URLPattern({ pathname }), handler]);
  // start server for each function
  listen((request) => {
    const fn = functions.find(([pattern]) => pattern.test(request.url));
    if (!fn) return new Response("Not found", { status: 404 });
    const [pattern, handler] = fn;
    const match = pattern.exec(request.url)!;
    return handler(request, { pathnameParams: match.pathname.groups });
  }, { port });
  log?.info(`Functions running on port ${port}`);
};
