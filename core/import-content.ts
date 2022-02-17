import type {
  Cache,
  ContentImporter,
  ImportedContent,
  Logger,
} from "../domain.ts";
import { createContentWriter } from "./fs.ts";

const createContentFile = (frontmatter: unknown) =>
  `---\n${JSON.stringify(frontmatter, undefined, 2)}\n---\n`;

export const lastUpdateCacheKey = "last-import.json";

export const importContent = async (
  contentImporter: ContentImporter,
  contentDir: string,
  cache: Cache,
  log?: Logger,
  writeContent?: (content: ImportedContent) => Promise<void>,
): Promise<void> => {
  // use default content writer if not passed in as param
  writeContent ??= createContentWriter(contentDir, createContentFile);
  let count = 0;

  log?.info("Importing content...");

  for await (
    let content of contentImporter
  ) {
    // if undefined was returned, it means the generator wants the last update date
    if (!content) {
      // dates get deserialized as strings
      const lastUpdateString = await cache.get<string>(lastUpdateCacheKey);
      const lastUpdate = lastUpdateString
        ? new Date(lastUpdateString)
        : undefined;
      // pass in the date here
      const next = await contentImporter.next(lastUpdate);
      // use this next yield as content
      content = next.value;
    }

    // write or delete
    if (content && "data" in content) {
      await writeContent(content);
      count++;
    } else if (content && "delete" in content && content.delete) {
      log?.warning("Deletion as part of partial updates not supported");
    } else {
      log?.error(`Malformed content: ${JSON.stringify(content)}`);
    }
  }

  // save import date to cache
  await cache.put<Date>(lastUpdateCacheKey, new Date());

  log?.info(`Done importing ${count} content pages`);
};
