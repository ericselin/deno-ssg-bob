import { assertEquals } from "../deps.ts";
import { sortDateDesc } from "./sort-date.ts";

Deno.test("desc date sorting works and puts no-date at top", () => {
  const arr = [
    { order: 3, date: new Date("2021-10-03") },
    { order: 1 },
    { order: 5, date: new Date("2021-10-01") },
    { order: 4, date: new Date("2021-10-02") },
    { order: 2 },
  ];
  const order = arr.sort(sortDateDesc).map(({ order }) => order);
  assertEquals(order, [1, 2, 3, 4, 5]);
});
