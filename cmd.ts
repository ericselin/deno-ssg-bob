import { build } from "./mod.ts";
import { log, parseFlags } from "./deps.ts";

const { v: verbose, f: force } = parseFlags(Deno.args);

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
