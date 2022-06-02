import { ensureDir, Logger, path } from "../deps.ts";

export type Cacher = (
  request: Request,
  response: Response,
) => Promise<void> | void;

export type CacheUpdater = (urlOrPathname: string) => unknown;

/**
 * @alpha
 */
export const cacheResponseBody = (publicDir: string, log: Logger): Cacher => {
  const getFilepath = _requestToCacheFilepath(publicDir, log);
  return async (request: Request, response: Response) => {
    if (request.method === "GET" && response.ok && response.body) {
      const filepath = getFilepath(
        request.url,
        response.headers.get("Content-Type"),
      );
      // if no file path, don't cache
      if (!filepath) return;

      const responseToFile = response.clone();

      await ensureDir(path.dirname(filepath));
      const file = await Deno.open(filepath, {
        read: false,
        write: true,
        create: true,
      });
      responseToFile.body?.pipeTo(file.writable);
    }
  };
};

/**
 * @alpha
 */
export const updateCache = (
  handler: (req: Request) => Promise<Response> | Response,
  log: Logger,
): CacheUpdater => {
  return (urlOrPathname) => {
    log?.debug(`Updating cache at ${urlOrPathname}`);
    const url = new URL(urlOrPathname, "http://localhost");
    handler(new Request(url.toString()));
  };
};

export const _requestToCacheFilepath = (publicDir: string, log?: Logger) => {
  /** Check if segmented path is a directory */
  const isDirectory = (segments: string[]): boolean =>
    !segments[segments.length - 1];

  return (url: string, contentType?: string | null): string | undefined => {
    // split the pathname into parts
    const pathSegments = new URL(url).pathname.split("/");
    // if this is an html file (very likely), check that we have
    // a trailing slash, since this is only smart
    // if not, it should not be a directory
    if (contentType === "text/html") {
      if (!isDirectory(pathSegments)) {
        log?.warning(
          `Cached HTML responses should have a trailing slash (${url})`,
        );
        return;
      }
      pathSegments.push("index.html");
    } else if (isDirectory(pathSegments)) {
      log?.warning(
        `Non-HTML responses ending in slash cannot be cached (${url})`,
      );
      return;
    }
    return path.join(publicDir, ...pathSegments);
  };
};
