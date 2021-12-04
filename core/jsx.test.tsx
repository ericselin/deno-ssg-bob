/** @jsx h */

import { assertEquals } from "../deps.ts";
import { createRenderer, h } from "./jsx.ts";
import { ContentType } from "../domain.ts";
import type { BuildOptions, Component, Page } from "../domain.ts";

const render = createRenderer({} as BuildOptions)();

Deno.test("basic jsx rendering works", async () => {
  const Sub: Component<{ someone: string }> = (
    { someone }: { someone: string },
  ) => <p>Hello {someone}</p>;

  const Base: Component = () => (
    <div class="moi" id="ehlo">
      <h1>Hello</h1>
      <Sub someone="world" />
    </div>
  );

  assertEquals(
    await render(<Base />),
    '<div class="moi" id="ehlo"><h1>Hello</h1><p>Hello world</p></div>',
  );
});

Deno.test("rendering jsx with children works", async () => {
  const Sub: Component = ({ children }) => <p>Hello {children}</p>;

  const Base: Component = () => (
    <div>
      <h1>Hello</h1>
      <Sub>world</Sub>
    </div>
  );

  assertEquals(
    await render(<Base />),
    "<div><h1>Hello</h1><p>Hello world</p></div>",
  );
});

Deno.test("rendering jsx with spread props works", async () => {
  const Base: Component = ({ children }) => (
    <div>
      <h1>Hello</h1>
      {children}
    </div>
  );
  const Sub: Component<{ who: string }> = (props) => (
    <Base {...props}>
      <p>Hello {props.who}</p>
    </Base>
  );

  assertEquals(
    await render(<Sub who="world" />),
    "<div><h1>Hello</h1><p>Hello world</p></div>",
  );
});

Deno.test("async jsx rendering works", async () => {
  const asyncify = (str: string) =>
    new Promise((resolve) => setTimeout(resolve, 1, str));

  const Hello: Component<{ someone: string }> = async (
    { someone }: { someone: string },
  ) => <p>Hello {await asyncify(someone)}</p>;

  assertEquals(
    await render(<Hello someone="world" />),
    "<p>Hello world</p>",
  );
});

Deno.test("rendering nested custom jsx elements works", async () => {
  const Sub: Component = ({ children }) => <p>Hello {children}</p>;

  const Base: Component = () => <Sub>world</Sub>;

  assertEquals(
    await render(<Base />),
    "<p>Hello world</p>",
  );
});

Deno.test("childPages pages getter run with correct glob", async () => {
  const getPages = (glob: string | string[]): Promise<Page[]> =>
    //@ts-ignore this returns string just for the test
    Promise.resolve(glob);

  const render = createRenderer({
    contentDir: "../content",
    layoutDir: "",
    publicDir: "",
  }, getPages)({
    type: ContentType.Page,
    //@ts-ignore only content path needed
    location: {
      contentPath: "page/index.md",
    },
    frontmatter: {},
    content: "",
  });

  const Children: Component<
    Record<string, unknown>,
    undefined,
    undefined,
    unknown
  > = async (_, { childPages }) => (
    <p>{childPages && (await childPages)?.join(",")}</p>
  );

  assertEquals(
    await render(<Children />),
    "<p>page/!(index).md,page/*/index.md</p>",
  );
});

Deno.test("childPages calls getPage only for index.md files", async () => {
  const getPages = (_glob: string | string[]): Promise<Page[]> => {
    throw new Error("This should not be called");
  }

  const render = createRenderer({
    contentDir: "../content",
    layoutDir: "",
    publicDir: "",
  }, getPages)({
    type: ContentType.Page,
    //@ts-ignore only content path needed
    location: {
      contentPath: "page/page.md",
    },
    frontmatter: {},
    content: "",
  });

  const Children: Component<
    Record<string, unknown>,
    undefined,
    undefined,
    unknown
  > = async (_, { childPages }) => (
    <p>{childPages && (await childPages)?.join(",")}</p>
  );

  assertEquals(
    await render(<Children />),
    "<p></p>",
  );
});
