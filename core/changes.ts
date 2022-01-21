import type { Change } from "../domain.ts";

/** Filter duplicates (inefficient algo, but we generally only have a few items in the array) */
const _removeDuplicateChanges = (
  change: Change,
  index: number,
  changes: Change[],
): boolean =>
  changes.findIndex((c) =>
    c.type === change.type && c.inputPath === change.inputPath
  ) === index;

/** Filter modifications for deleted and created files */
const _removeModifiedWhenAlsoCreatedOrDeleted = (
  change: Change,
  _index: number,
  changes: Change[],
): boolean =>
  change.type !== "modify" ||
  changes.findIndex(
      (c) => (c.inputPath === change.inputPath && c.type !== "modify"),
    ) < 0;

export const sanitizeChangesFilter = (
  change: Change,
  index: number,
  changes: Change[],
): boolean =>
  _removeDuplicateChanges(change, index, changes) &&
  _removeModifiedWhenAlsoCreatedOrDeleted(change, index, changes);
