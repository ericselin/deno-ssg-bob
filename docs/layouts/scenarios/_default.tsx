/** @jsx h */

import { h, LayoutWantsPages } from "../../../mod.ts";
import { Base } from "../_base.tsx";

const Index: LayoutWantsPages<
  { frontmatter: { title?: string } },
  { title?: string; url?: string }
> = (
  props,
  pages,
) => (
  <Base {...props}>
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
      {props.frontmatter.title && <h1>{props.frontmatter.title}</h1>}
      {props.content}
    </main>
  </Base>
);

Index.wantsPages = "scenarios/*.md";

export default Index;
