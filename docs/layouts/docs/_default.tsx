/** @jsx h */

import { Component, h } from "../../../mod.ts";
import { Base } from "../_base.tsx";

const Scenarios: Component<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
> = (
  _props,
  { wantedPages, page },
) => (
  <Base>
    <nav>
      <ul>
        <li>
          <a href={page.location.url.pathname}>{page.title}</a>
        </li>
        {wantedPages?.map((page) => (
          <li>
            <a href={page.location.url.pathname}>{page.title}</a>
          </li>
        ))}
      </ul>
    </nav>
    <main>
      {page.frontmatter.title && <h1>{page.frontmatter.title}</h1>}
      {page.content}
    </main>
  </Base>
);

Scenarios.needsCss = "docs/_default.css";
Scenarios.wantsPages = "docs/*.md";

export default Scenarios;
