import type { BuildOptions, Change } from "../../domain.ts";
import { debounce, path } from "./../../deps.ts";
import { removeDuplicateChanges } from "../changes.ts";

type ChangeArrayFn<R> = (
  change: Change,
  i: number,
  changes: Change[],
) => R;
type ChangeArrayFilter = ChangeArrayFn<boolean>;

export const changeOnFileModifications = async (
  buildOptions: BuildOptions,
  applyChanges: (changes: Change[]) => Promise<unknown>,
) => {
  /** File watcher for content and layout dirs. */
  const watcher = Deno.watchFs([
    //buildOptions.layoutDir,
    buildOptions.contentDir,
  ]);

  const pendingEvents: Deno.FsEvent[] = [];
  const getChanges = _changesFromFsEvents(buildOptions);
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
};

export const restartOnFileModifications = async (
  directory: string,
  cmd: string[],
) => {
  /** File watcher for content and layout dirs. */
  const watcher = Deno.watchFs([
    directory,
  ]);

  let process = Deno.run({ cmd });

  const restart = debounce(
    async () => {
      process.kill("SIGTERM");
      await process.status();
      process = Deno.run({ cmd });
    },
    100,
  );

  for await (const event of watcher) {
    if (event.kind !== "access") {
      restart();
    }
  }
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

/** Filter out filest that were first created then immediately removed */
const _removeTempFiles: ChangeArrayFilter = (change, i, changes) => {
  // remove anything followed by delete
  if (change.type !== "delete" && change.type !== "orphan") {
    const lastDeleteThisFile = changes.findLastIndex((c) =>
      c.type === "delete" && c.inputPath === change.inputPath
    );
    if (lastDeleteThisFile > i) {
      return false;
    }
  }
  // remove delete when preceded by create
  if (change.type === "delete") {
    const firstCreateThisFile = changes.findIndex((c) =>
      c.type === "create" && c.inputPath === change.inputPath
    );
    if (firstCreateThisFile >= 0 && firstCreateThisFile < i) {
      return false;
    }
  }
  return true;
};

/** Turn delete followed by create into a single modify using reducer */
const _processFileRefresh = (
  newChanges: Change[],
  change: Change,
  i: number,
  changes: Change[],
): Change[] => {
  // do not append delete followed by create
  if (
    change.type === "delete" &&
    changes.findLastIndex((c) =>
        c.type === "create" && c.inputPath === change.inputPath
      ) > i
  ) {
    return newChanges;
  }
  // turn create preceded by delete into modify
  if (change.type === "create") {
    const firstDeleteThisFile = changes.findIndex((c) =>
      c.type === "delete" && c.inputPath === change.inputPath
    );
    if (firstDeleteThisFile >= 0 && firstDeleteThisFile < i) {
      return newChanges.concat({ ...change, type: "modify" });
    }
  }
  return newChanges.concat(change);
};

/** Remove modifications of created and deleted files */
const _removeModificationsWhenCreateOrDelete: ChangeArrayFilter = (
  change,
  _i,
  changes,
) => {
  if (
    change.type === "modify" &&
    changes.findIndex((c) =>
        (c.type === "create" || c.type === "delete") &&
        c.inputPath === change.inputPath
      ) >= 0
  ) {
    return false;
  }
  return true;
};

/** Set path relative to CWD */
const _setPathToCwdRelative = (change: Change): Change =>
  "inputPath" in change
    ? {
      ...change,
      inputPath: path.relative(Deno.cwd(), change.inputPath),
    }
    : {
      ...change,
      outputPath: path.relative(Deno.cwd(), change.outputPath),
    };

export const _changesFromFsEvents = (options?: BuildOptions) =>
  (events: Deno.FsEvent[]): Change[] => {
    options?.log?.debug(
      `Creating changes from fs events ${JSON.stringify(events)}`,
    );
    const changes: Change[] = events
      .filter((event) => event.kind !== "access") // filter out access events
      .map(_eventToChange)
      .flat() // above may create nested arrays, so flatten
      .filter(_removeTempFiles)
      .reduce<Change[]>(_processFileRefresh, [])
      .filter(_removeModificationsWhenCreateOrDelete)
      .filter(removeDuplicateChanges)
      .map(_setPathToCwdRelative); // set paths to cwd-relative
    // clear array after transforming to changes
    events.splice(0);
    return changes;
  };
