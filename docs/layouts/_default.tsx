/** @jsx h */

import { h, Layout } from "../../mod.ts";
import { Base } from "./_base.tsx";

const Index: Layout = (
  props,
) => (
  <Base {...props}>
    <main>
      {props.content}
    </main>
  </Base>
);

export default Index;
