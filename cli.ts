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
  -p, --public    path to public directory
  -f, --force     force build everything
                  will clean the current public directory
  -d, --drafts    build draft pages
  -v, --verbose   verbose logging
  -h, --help      show help
  -l, --license   show license information`;

const license = `Copyright 2021 Eric Selin

\`bob\` is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

\`bob\` is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with \`bob\`. If not, see <https://www.gnu.org/licenses/>.

Please contact the developers via GitHub <https://www.github.com/ericselin>
or email eric.selin@gmail.com <mailto:eric.selin@gmail.com>`;

const licenseShort = `\`bob\` Copyright 2021 Eric Selin
This program comes with ABSOLUTELY NO WARRANTY.
This is free software, and you are welcome to
redistribute it under certain conditions.
For details run the program with the \`-l\` argument.
`;

const {
  _: [action],
  ...args
} = parseFlags(Deno.args, {
  alias: {
    public: "p",
    force: "f",
    drafts: "d",
    verbose: "v",
    help: "h",
    license: "l",
  },
});

const SERVER_ARG = "server";
const server = action === SERVER_ARG;

if (args.license) {
  console.log(license);
  Deno.exit();
}

console.log(licenseShort);

if (args.help) {
  console.log(usage);
  Deno.exit();
}

const logLevel = args.verbose ? "DEBUG" : "INFO";

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
  publicDir: args.public || "public",
  force: args.force,
  buildDrafts: args.drafts,
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
