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

const SERVER_ARG = "server";
const server = arg === SERVER_ARG;

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
  // Start HTTP server of public folder
  serve({ directory: "public", log });

  /** File watcher for content and layout dirs. */
  const watcher = Deno.watchFs([
    buildOptions.layoutDir,
    buildOptions.contentDir,
  ]);
  /** Timer id of `setTimeout` used for debouncing. */
  let runningTimer = 0;
  /**
  Command to run. Always run via the `bob` executable.
  Pass in original arguments, except for the "server" argument.
  */
  const cmd = ["bob", ...Deno.args.filter((arg) => arg !== SERVER_ARG)];

  for await (const event of watcher) {
    // Don't build on access events
    if (event.kind !== "access") {
      log.info(`Files changed: ${event.kind} ${event.paths}`);
      // Continue only if we're not already waiting for a build to begin
      if (!runningTimer) {
        log.debug("Starting timeout for building");
        // Start timeout for build
        runningTimer = setTimeout(async () => {
          // Spawn new process for re-building. This makes Deno check for updated
          // modules (i.e. layouts) and reloads them as neccessary.
          const buildProcess = Deno.run({ cmd });
          await buildProcess.status();
          // Remember to reset the timer id
          runningTimer = 0;
        }, 100);
      }
    }
  }
}
