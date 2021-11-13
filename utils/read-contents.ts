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

type MaybeString = string | undefined;

export function readContents(filepath: MaybeString): Promise<MaybeString>;
export function readContents(filepaths: (MaybeString)[]): Promise<MaybeString>;

export async function readContents(filepath: MaybeString | MaybeString[]) {
  if (!filepath) return;
  if (typeof filepath === "string") {
    return Deno.readTextFile(filepath);
  } else {
    return (await Promise.all(
      filepath.map((path) => path && Deno.readTextFile(path)),
    ))
      .filter(Boolean)
      .join("\n");
  }
}
