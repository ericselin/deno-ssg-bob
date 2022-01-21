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
import { build, serve as serveStatic } from "./mod.ts";
import { log, parseFlags } from "./deps.ts";
import { serve as serveFunctions } from "./functions/mod.ts";
import { createChangesApplier } from "./core/api.ts";
import changeOnFileModifications from "./core/change-providers/fs-mod.ts";

const usage = `bob the static site builder

Build the content files in the \`content\` directory,
using the TSX layouts in the \`layouts\` directory,
into the output directory \`public\`.

Builds are by default incremental, i.e. build only
what is needed.

USAGE:
  bob [ACTION] [OPTIONS]

ACTION \`functions\`
  Start production server in order to service requests for fuctions.

ACTION \`server\`
  Start development server serving both static files and functions.

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
const functions = action === "functions";

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

const functionsPort = 8081;

if (functions || server) {
  serveFunctions({ log, buildOptions });
}

if (server) {
  // Start HTTP server of public folder
  serveStatic({
    directory: "public",
    log,
    proxy404: `localhost:${functionsPort}`,
  });

  const applyChanges = createChangesApplier(buildOptions);
  changeOnFileModifications(buildOptions, applyChanges);
}

await build(buildOptions);
