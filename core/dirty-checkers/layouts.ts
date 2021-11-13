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

import type { DirtyCheckerCreator } from "../../domain.ts";
import { exists, path, walk } from "../../deps.ts";

export const _latestModification = async (
  dir: string,
  extensions?: string[],
): Promise<Date | null> => {
  let latestModTime: Date | null = null;
  for await (const dirEntry of walk(dir)) {
    if (extensions && !extensions.includes(path.extname(dirEntry.name))) {
      continue;
    }
    const stat = await Deno.stat(dirEntry.path);
    if (!latestModTime) latestModTime = stat.mtime;
    else if (stat.mtime && stat.mtime > latestModTime) {
      latestModTime = stat.mtime;
    }
  }
  return latestModTime;
};

export const isOlder = async (
  compareDir: string,
  baseDir: string,
  baseFileExtensions?: string[],
): Promise<boolean> => {
  if (!await exists(compareDir)) return true;
  const baseTime = await _latestModification(
    baseDir,
    baseFileExtensions,
  );
  const compareTime = await _latestModification(compareDir);

  if (!compareTime || !baseTime) return true;
  return compareTime < baseTime;
};

const dirtyLayouts: DirtyCheckerCreator = (
  { layoutDir, publicDir, log },
) => {
  let publicDirOlder: boolean;
  return async () => {
    if (typeof publicDirOlder === "undefined") {
      publicDirOlder = await isOlder(publicDir, layoutDir);
      if (publicDirOlder) {
        log?.warning("Layouts changed, marking everything dirty");
      }
    }
    return publicDirOlder;
  };
};

export default dirtyLayouts;
