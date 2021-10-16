/** @jsx h */

import { Component, ContentBase, h } from "../../mod.ts";
import { Base } from "./_base.tsx";

const Index: Component<ContentBase<undefined, undefined>> = (
  props,
) => (
  <Base {...props}>
    <main>
      {props.content}
    </main>
  </Base>
);

export default Index;