import { assertEquals } from "../../deps.ts";
import { _changesFromFsEvents } from "./fs-mod.ts";

Deno.test("basic nvim modification works", () => {
  const modifications: Deno.FsEvent[] = [{
    "kind": "create",
    "paths": ["content/4913"],
    "flag": undefined,
  }, {
    "kind": "modify",
    "paths": ["content/4913"],
    "flag": undefined,
  }, {
    "kind": "access",
    "paths": ["content/4913"],
    "flag": undefined,
  }, {
    "kind": "remove",
    "paths": ["content/4913"],
    "flag": undefined,
  }, {
    "kind": "modify",
    "paths": ["content/index.md"],
    "flag": undefined,
  }, {
    "kind": "modify",
    "paths": ["content/index.md~"],
    "flag": undefined,
  }, {
    "kind": "modify",
    "paths": [
      "content/index.md",
      "content/index.md~",
    ],
    "flag": undefined,
  }, {
    "kind": "create",
    "paths": ["content/index.md"],
    "flag": undefined,
  }, {
    "kind": "modify",
    "paths": ["content/index.md"],
    "flag": undefined,
  }, {
    "kind": "access",
    "paths": ["content/index.md"],
    "flag": undefined,
  }, {
    "kind": "modify",
    "paths": ["content/index.md"],
    "flag": undefined,
  }, {
    "kind": "remove",
    "paths": ["content/index.md~"],
    "flag": undefined,
  }];

  const changes = _changesFromFsEvents()(modifications);
  assertEquals(changes, [{ type: "modify", inputPath: "content/index.md" }]);
});

Deno.test("touching file results in single create", () => {
  const modifications: Deno.FsEvent[] = [{
    "kind": "create",
    "paths": ["content/index.md"],
    "flag": undefined,
  }, {
    "kind": "modify",
    "paths": ["content/index.md"],
    "flag": undefined,
  }, {
    "kind": "access",
    "paths": ["content/index.md"],
    "flag": undefined,
  }];

  const changes = _changesFromFsEvents()(modifications);
  assertEquals(changes, [{ type: "create", inputPath: "content/index.md" }]);
});

Deno.test("moving file results in delete and create", () => {
  const modifications: Deno.FsEvent[] = [{
    "kind": "modify",
    "paths": ["content/test"],
    "flag": undefined,
  }, {
    "kind": "modify",
    "paths": ["content/test2"],
    "flag": undefined,
  }, {
    "kind": "modify",
    "paths": [
      "content/test",
      "content/test2",
    ],
    "flag": undefined,
  }];

  const changes = _changesFromFsEvents()(modifications);
  assertEquals(changes, [
    { type: "delete", inputPath: "content/test" },
    { type: "create", inputPath: "content/test2" },
  ]);
});
