/** @jsx h */

import { h, LayoutWantsPages } from "../../../mod.ts";
import { Base } from "../_base.tsx";

const Index: LayoutWantsPages = (
  props,
) => (
  <Base {...props}>
    Nav
    <nav>
      <ul>
        <li>
          {props.pages.map((page) => <a href={""}>{page}</a>)}
        </li>
      </ul>
    </nav>
    <main>
      {props.content}
    </main>
  </Base>
);

Index.wantsPages = ["**/*.md"];

export default Index;
