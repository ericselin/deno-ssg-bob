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

import { listenAndServe } from "https://deno.land/std@0.113.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.113.0/http/file_server.ts";
import { posix } from "https://deno.land/std@0.113.0/path/mod.ts";
import type { Logger } from "../deps.ts";

type ServerOptions = {
  directory: string;
  port?: number;
  host?: string;
  log?: Logger;
};

export const serve = (options: ServerOptions): void => {
  const directory = options.directory ?? "public";
  const port = options.port ?? 8080;
  const host = options.host ?? "0.0.0.0";
  const addr = `${host}:${port}`;
  const { log } = options;

  const handler = async (req: Request): Promise<Response> => {
    let response: Response;
    let fsPath: string | undefined = undefined;

    try {
      const normalizedUrl = new URL(req.url).pathname;
      fsPath = posix.join(directory, normalizedUrl);
      if (fsPath.endsWith("/")) fsPath = posix.join(fsPath, "index.html");

      response = await serveFile(req, fsPath);
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) {
        response = new Response(`Could not find ${fsPath ?? req.url}`, { status: 404 });
      } else {
        log?.error(err.toString());
        response = new Response(err.toString(), { status: 500 });
      }
    }

    log?.debug(`[${response.status}] ${req.url}`);

    return response!;
  };

  listenAndServe(addr, handler);

  log?.info(
    `HTTP server listening on http://${addr.replace("0.0.0.0", "localhost")}/`,
  );
};
