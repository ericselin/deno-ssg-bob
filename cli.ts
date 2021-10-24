import { build } from "./mod.ts";
import { log, parseFlags } from "./deps.ts";

const usage = `bob the static site builder

Build the content files in the \`content\` directory,
using the TSX layouts in the \`layouts\` directory,
into the output directory \`public\`.

Builds are by default incremental, i.e. build only
what is needed.

OPTIONS:

-f    force build everything
      will clean the current public directory
-v    verbose logging
-h    show help`;

const { v: verbose, f: force, h: help } = parseFlags(Deno.args);

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

const results = await build({
  contentDir: "content",
  layoutDir: "layouts",
  publicDir: "public",
  force,
  log,
});

log.info(`Built ${results.renderCount} pages in ${results.durationMs} ms`);
