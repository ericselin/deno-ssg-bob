/** @jsx h */

import { h, Layout } from "../../../mod.ts";
import { Base } from "../_base.tsx";

const Index: Layout<undefined, undefined> = (
  props,
) => (
  <Base {...props}>
    Nav
    <nav>
      <ul>
        <li>
          <a href={""}>{}</a>
        </li>
      </ul>
    </nav>
    <main>
      {props.content}
    </main>
  </Base>
);

export default Index;
