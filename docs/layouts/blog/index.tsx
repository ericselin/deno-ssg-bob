/** @jsx h */

import { Component, h, sortDateDesc } from "../../../mod.ts";
import { Base } from "../_base.tsx";
import { Summary } from "../_summary.tsx";

const C: Component<any, { title: string }, { title: string }> = (
  _props,
  { page: { content, title }, wantedPages },
) => (
  <Base>
    <h1>{title}</h1>
    <main>
      {wantedPages?.sort(sortDateDesc).map((post) => <Summary post={post} />)}
      {content}
    </main>
  </Base>
);

C.wantsPages = "blog/*.md";

export default C;
