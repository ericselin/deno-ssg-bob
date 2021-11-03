/** @jsx h */

import { Component, h } from "../../../../../mod.ts";

type EmptyObject = Record<string, never>;

const Index: Component<EmptyObject, unknown, EmptyObject> = (
  _props,
  { page: { content }, wantedPages },
) => (
  <body>
    {content}
    <main>
      {wantedPages?.map((page) => (
        <article>
          <h2>{page.title}</h2>
          {page.summary}
        </article>
      ))}
    </main>
  </body>
);

Index.wantsPages = "*.md";

export default Index;
