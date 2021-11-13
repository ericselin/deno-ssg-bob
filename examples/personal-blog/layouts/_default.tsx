/** @jsx h */

import { Component, h } from "./deps.ts";
import { Base } from "./_base.tsx";

const Default: Component = (
  _props,
  { page: { content, title } },
) => (
  <Base>
    {title && <h1>{title}</h1>}
    <main>
      {content}
    </main>
  </Base>
);

export default Default;
