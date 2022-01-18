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

import { path } from "../deps.ts";
import type {
  FileReader,
  Location,
  OutputFileWriterCreator,
  StaticFileWriterCreator,
} from "../domain.ts";
import { ContentType } from "../domain.ts";

export type DirectoryPath = string;

export const readContentFile: FileReader = () =>
  async (location) => {
    if (location.type === ContentType.Page) {
      const content = await Deno.readTextFile(location.inputPath);
      location;
      return {
        type: ContentType.Page,
        location: location as Location<ContentType.Page>,
        content,
      };
    } else {
      return {
        type: ContentType.Static,
        location: location as Location<ContentType.Static>,
      };
    }
  };

export const createOutputFileWriter: OutputFileWriterCreator = ({ log }) =>
  async (
    outputFile,
  ) => {
    await Deno.mkdir(path.dirname(outputFile.path), { recursive: true });
    await Deno.writeTextFile(outputFile.path, outputFile.output);
    log?.info(`Wrote file ${outputFile.path} to disk`);
  };

export const createStaticFileWriter: StaticFileWriterCreator = ({ log }) =>
  async ({ location }) => {
    await Deno.mkdir(path.dirname(location.outputPath), { recursive: true });
    await Deno.copyFile(location.inputPath, location.outputPath);
    log?.info(`Copied static file to ${location.outputPath}`);
  };

export const cleanDirectory = async (dirpath: DirectoryPath): Promise<void> => {
  for await (const dirEntry of Deno.readDir(dirpath)) {
    await Deno.remove(path.join(dirpath, dirEntry.name), { recursive: true });
  }
};
