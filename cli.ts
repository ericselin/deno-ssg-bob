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

import type { BuildOptions, ConfigFile } from "./domain.ts";
import { build, serve as serveStatic } from "./mod.ts";
import { log, parseFlags } from "./deps.ts";
import {
  serve as serveFunctions,
  writeNginxLocations,
} from "./functions/mod.ts";
import type { Functions } from "./functions/mod.ts";
import { createChangesApplier } from "./core/api.ts";
import {
  changeOnFileModifications,
  restartOnFileModifications,
} from "./core/change-providers/fs-mod.ts";
import { FileCache } from "./core/cache.ts";
import { loadIfExists } from "./core/module-loader.ts";
import { importContent } from "./core/import-content.ts";

const usage = `bob the static site builder

Build the content files in the \`content\` directory,
using the TSX layouts in the \`layouts\` directory,
into the output directory \`public\`.

Builds are by default incremental, i.e. build only
what is needed.

USAGE:
  bob [COMMAND] [OPTIONS]

COMMAND \`build\` (default if command not specified) 
  Build (render) site into public directory. Will do an incremental build -
  use \`--force\` to re-build everything.

COMMAND \`watch\`
  Build site into public directory and re-build content file changes.

COMMAND \`functions\`
  Start production server in order to service requests for fuctions.
  OPTIONS specific to this command:
    --fn-nginx-conf     write function locations to nginx configuration file
    --fn-hostname       hostname to use for nginx proxing

COMMAND \`server\`
  Start development server serving both static files and functions.
  Will re-build the site on content file and layout changes.
  (Internally, this uses the \`watch\` command, restarting it on layout changes.)

OPTIONS:
  -i, --import          import content before building
  -p, --public          path to public directory
  -f, --force           re-build from scratch (deletes public dir and cache)
  -d, --drafts          build draft pages
  -v, --verbose         verbose logging
  -h, --help            show help
  -l, --license         show license information`;

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
    fnNginxConf: "fn-nginx-conf",
    fnHostname: "fn-hostname",
    import: "i",
  },
});

const SERVER_ARG = "server";
const server = action === SERVER_ARG;
const functions = action === "functions";
// this is a hidden internal command
const watcher = action === "watch";

if (args.license) {
  console.log(license);
  Deno.exit();
}

if (!watcher) {
  console.log(licenseShort);
}

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
  cache: new FileCache(),
  force: args.force,
  buildDrafts: args.drafts,
  log,
};

let functionDefinitions: Functions | undefined = undefined;

// try to load config
const configModule = await loadIfExists("bob.ts");
const configFile: ConfigFile | undefined = configModule?.default;
if (configFile) {
  log.info("Using config file `bob.ts`");
  // import content if we have an importer and CLI flag set
  if (configFile.contentImporter && args.import) {
    await importContent(
      configFile.contentImporter,
      buildOptions.contentDir,
      buildOptions.cache,
      log,
    );
  }
  functionDefinitions = configFile.functions;
}

const functionsPort = 8081;

if (functions || server) {
  await serveFunctions({ log, buildOptions, functionDefinitions });
}

if (args.fnNginxConf) {
  const hostname = args.fnHostname || Deno.env.get("HOSTNAME");
  if (!hostname) {
    throw new Error(
      "Please provide hostname for nginx proxy (--fn-hostname or $HOSTNAME)",
    );
  }
  log.info(`Functions using hostname ${hostname}`);
  log.info(`Writing nginx locations to ${args.fnNginxConf}`);
  await writeNginxLocations(args.fnNginxConf, hostname, functionsPort);
  log.info(
    `Done! Feel free to reload nginx and possibly stop previous functions server`,
  );
}

if (server) {
  // Start HTTP server of public folder
  serveStatic({
    directory: "public",
    log,
    proxy404: `localhost:${functionsPort}`,
  });

  /**
  Command to run. Always run via the `bob` executable.
  Pass in original arguments, except for the "server" argument.
  */
  const cmd = [
    "bob",
    ...Deno.args.map((arg) => arg === SERVER_ARG ? "watch" : arg),
  ];

  restartOnFileModifications(buildOptions.layoutDir, cmd);
}

if (watcher) {
  const applyChanges = createChangesApplier(buildOptions);
  changeOnFileModifications(buildOptions, applyChanges);
}

if (!functions && !server) {
  await build(buildOptions);
}
