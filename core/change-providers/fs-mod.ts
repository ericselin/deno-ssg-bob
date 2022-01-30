import type { BuildOptions, Change } from "../../domain.ts";
import { debounce, path } from "./../../deps.ts";
import { sanitizeChangesFilter } from "../changes.ts";

export default async function changerFileModifications(
  buildOptions: BuildOptions,
  applyChanges: (changes: Change[]) => Promise<unknown>,
) {
  /** File watcher for content and layout dirs. */
  const watcher = Deno.watchFs([
    //buildOptions.layoutDir,
    buildOptions.contentDir,
  ]);

  buildOptions.log?.warning("Not updating on layout changes");

  const pendingEvents: Deno.FsEvent[] = [];
  const getChanges = changesFromFsEvents(buildOptions);
  const applyEvents = debounce(
    (events: Deno.FsEvent[]) => applyChanges(getChanges(events)),
    100,
  );

  for await (const event of watcher) {
    // add this event to the array
    pendingEvents.push(event);
    // apply events (debounced, as per above)
    applyEvents(pendingEvents);
  }
}

/** Set path relative to CWD */
const _setPathToCwdRelative = (
  change: Change,
): Change =>
  "inputPath" in change
    ? {
      ...change,
      inputPath: path.relative(Deno.cwd(), change.inputPath),
    }
    : {
      ...change,
      outputPath: path.relative(Deno.cwd(), change.outputPath),
    };

/** Create one or many changes based on a filesystem event */
const _eventToChange = (event: Deno.FsEvent): Change | Change[] => {
  // turn one file modification to modify
  if (event.kind === "modify" && event.paths.length === 1) {
    return {
      type: "modify",
      inputPath: event.paths[0],
    };
  }
  // turn two file modification to remove and create
  if (event.kind === "modify" && event.paths.length === 2) {
    return [{
      type: "delete",
      inputPath: event.paths[0],
    }, {
      type: "create",
      inputPath: event.paths[1],
    }];
  }
  // process remove
  if (event.kind === "remove") {
    return {
      type: "delete",
      inputPath: event.paths[0],
    };
  }
  // process create
  if (event.kind === "create") {
    return {
      type: "create",
      inputPath: event.paths[0],
    };
  }

  throw new Error(`Could not process event ${JSON.stringify(event)}`);
};

const changesFromFsEvents = ({ log }: BuildOptions) =>
  (events: Deno.FsEvent[]): Change[] => {
    log?.debug(`Creating changes from fs events ${JSON.stringify(events)}`);
    const changes: Change[] = events
      // filter out access events
      .filter((event) => event.kind !== "access")
      .map(_eventToChange)
      // above may create nested arrays, so flatten
      .flat()
      .map(_setPathToCwdRelative)
      .filter(sanitizeChangesFilter);
    // clear array after transforming to changes
    events.splice(0);
    return changes;
  };
