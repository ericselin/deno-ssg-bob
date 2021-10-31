import type { BuildOptions } from "./domain.ts";
import { build, serve } from "./mod.ts";
import { log, parseFlags } from "./deps.ts";

const usage = `bob the static site builder

Build the content files in the \`content\` directory,
using the TSX layouts in the \`layouts\` directory,
into the output directory \`public\`.

Builds are by default incremental, i.e. build only
what is needed.

USAGE:
  bob [server] [options]

OPTIONS:
  -f    force build everything
        will clean the current public directory
  -d    build draft pages
  -v    verbose logging
  -h    show help`;

const {
  v: verbose,
  f: force,
  h: help,
  d: buildDrafts,
  _: [arg],
} = parseFlags(Deno.args);
const server = arg === "server";

if (help) {
  console.log(usage);
  Deno.exit();
}

const logLevel = verbose ? "DEBUG" : "INFO";

await log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler(logLevel),
  },

  loggers: {
    default: {
      level: logLevel,
      handlers: ["console"],
    },
  },
});

const buildOptions: BuildOptions = {
  contentDir: "content",
  layoutDir: "layouts",
  publicDir: "public",
  force,
  buildDrafts,
  log,
};

await build(buildOptions);

if (server) {
  serve({ directory: "public", log });
  const watcher = Deno.watchFs([ buildOptions.layoutDir, buildOptions.contentDir ]);
  for await (const event of watcher) {
    log.info(`Files changed: ${event.kind} ${event.paths}`);
    await build(buildOptions);
  }
}
