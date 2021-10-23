/** @jsx h */

import { Component, h } from "../../../mod.ts";
import { Base } from "../_base.tsx";

type ScenarioData = { title?: string; url?: string };

const Scenarios: Component<
  { title?: string },
  ScenarioData,
  ScenarioData
> = (
  _props,
  { wantedPages, page },
) => (
  <Base>
    <nav>
      <ul>
        {wantedPages?.map((page) => (
          <li>
            <a href={page.frontmatter.url}>{page.frontmatter.title}</a>
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

Scenarios.needsCss = "scenarios/_default.css";
Scenarios.wantsPages = "scenarios/*.md";

export default Scenarios;
