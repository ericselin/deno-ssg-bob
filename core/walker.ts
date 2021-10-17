import type { WalkEntry } from "../domain.ts";
import { walk } from "../deps.ts";

export default async function* walkFiles (path: string): AsyncGenerator<WalkEntry> {
  for await (const walkEntry of walk(path)) {
    if (walkEntry.isFile) yield walkEntry;
  }
}
