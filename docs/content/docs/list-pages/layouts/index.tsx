/** @jsx h */

import { Component, h } from "../../../../../mod.ts";

type EmptyObject = Record<string, never>;

const Index: Component<EmptyObject, unknown, undefined, EmptyObject> = async (
  _props,
  { page: { content }, childPages },
) => (
  <body>
    {content}
    <main>
      {(await childPages)?.map((page) => (
        <article>
          <h2>{page.title}</h2>
          {page.summary}
        </article>
      ))}
    </main>
  </body>
);

export default Index;
