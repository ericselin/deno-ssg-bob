/** @jsx h */

import { Component, h } from "../../../../../mod.ts";
import { Base } from "./_base.tsx";

const Default: Component = (
  _props,
  { page: { content } },
) => (
  <Base>
    <main>
      {content}
    </main>
  </Base>
);

export default Default;
