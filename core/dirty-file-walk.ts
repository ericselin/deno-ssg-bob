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

import type {
  BuildOptions,
  DirtyChecker,
  LocationGenerator,
  FileWalkerCreator,
} from "../domain.ts";
import { walk } from "../deps.ts";
import getWalkEntryProcessor from "./walk-entry-processor.ts";

async function* walkFiles(
  options: BuildOptions,
  path: string,
): LocationGenerator {
  const processWalkEntry = getWalkEntryProcessor(options);
  for await (const walkEntry of walk(path)) {
    if (walkEntry.isFile) yield processWalkEntry(walkEntry);
  }
}

async function* yieldDirtyFilePaths(walk: LocationGenerator) {
  for await (const location of walk) {
    if (location.dirty) yield location;
  }
}

const createDirtyFileWalker: FileWalkerCreator = (dirtyCheckerCreators) =>
  (options) => {
    const dirtyCheckers = dirtyCheckerCreators.map((dirtyChekerCreator) =>
      dirtyChekerCreator(options)
    );
    async function* markDirty(walk: LocationGenerator, isDirty?: DirtyChecker) {
      for await (const location of walk) {
        if (location.dirty) {
          yield location;
          continue;
        } else if (isDirty && await isDirty(location)) {
          location.dirty = true;
          options.log?.debug(`Marking ${location.inputPath} dirty`);
        }
        yield location;
      }
    }
    return (dirpath) => {
      const dirtyCheckedWalker = dirtyCheckers.reduce(
        (walk, isDirty) => markDirty(walk, isDirty),
        markDirty(walkFiles(options, dirpath)),
      );
      return yieldDirtyFilePaths(dirtyCheckedWalker);
    };
  };

export default createDirtyFileWalker;
