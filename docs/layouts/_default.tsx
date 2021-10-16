/** @jsx h */

import { Layout, h } from "../../mod.ts";
import { Base } from "./_base.tsx";

const Index: Layout<undefined, undefined> = (
  props,
) => (
  <Base {...props}>
    <main>
      {props.content}
    </main>
  </Base>
);

export default Index;
