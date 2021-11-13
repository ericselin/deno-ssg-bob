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

type MaybeHasDate = {
  date?: Date
};

export const sortDateDesc = (a: MaybeHasDate, b: MaybeHasDate) => {
  // if both elements have dates, return numeric sort (desc) based on epoch
  if (a.date && b.date) return b.date.valueOf() - a.date.valueOf();
  // keep original order if no dates
  if (!a.date && !b.date) return 0;
  // if a has a date (but b doesn't), sort b before a
  if (a.date) return 1;
  // sort a before b, since here b has a date and a doesn't
  return -1;
};
