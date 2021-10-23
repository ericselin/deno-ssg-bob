/** @jsx h */

import { Component, h } from "../../../mod.ts";
import { Base } from "../_base.tsx";

type ScenarioData = { title?: string; url?: string };

const Index: Component<
  { title?: string },
  ScenarioData,
  ScenarioData
> = (
  _props,
  { pages, page },
) => (
  <Base>
    <nav>
      <ul>
        {pages?.map((page) => (
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

Index.wantsPages = "scenarios/*.md";

export default Index;
