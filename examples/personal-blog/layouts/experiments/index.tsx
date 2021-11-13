/** @jsx h */

import { Component, h, sortDateDesc } from "../deps.ts";
import { Base } from "../_base.tsx";

const C: Component<any, { title: string }, { title: string }> = (
  _props,
  { page: { content, title }, wantedPages },
) => (
  <Base>
    <h1>{title}</h1>
    <main>
      {wantedPages?.sort(sortDateDesc).map((experiment) => (
        <article>
          {experiment.content}
          <a
            href={experiment.location.url.pathname.replace("README/", "")}
            class="button-link"
          >
            🔥 See it in action 🔥
          </a>
        </article>
      ))}
      {content}
    </main>
  </Base>
);

C.wantsPages = "experiments/*/README.md";

export default C;
