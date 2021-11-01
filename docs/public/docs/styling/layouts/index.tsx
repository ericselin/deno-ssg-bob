/** @jsx h */

import { Component, h } from "../../../../../mod.ts";
import { Base } from "./_base.tsx";

const Index: Component = (
  _props,
  {page: {content}}
) => (
  <Base>
    <main>
      {content}
    </main>
  </Base>
);

// 1. Set the needed CSS filename here
Index.needsCss = "index.css";

export default Index;
