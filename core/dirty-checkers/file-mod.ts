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

import { exists } from "../../deps.ts";
import type { DirtyCheckerCreator } from "../../domain.ts";

const getModificationTime = async (filepath: string): Promise<Date | null> => {
  if (!await exists(filepath)) return null;
  const contentFile = await Deno.stat(filepath);
  return contentFile.mtime;
};

const dirtyFileMod: DirtyCheckerCreator = () =>
  async (location) => {
    // get modification time of content file
    const contentModTime = await getModificationTime(
      location.inputPath
    );
    if (!contentModTime) {
      throw new Error(
        `Content file ${location.inputPath} not found`,
      );
    }
    // get modification time of rendered file
    const outputModTime = await getModificationTime(location.outputPath);
    // if no output file mod time (does not exist), this is dirty
    if (!outputModTime) return true;
    // if content modified after render, this is dirty
    return contentModTime > outputModTime;
  };

export default dirtyFileMod;
