/** @jsx h */

import { Component, h } from "../../../../../mod.ts";

const Default: Component = (
  _props,
  { page: { content, title } },
) => (
  <main>
    {title && <h1>{title}</h1>}
    {content}
  </main>
);

export default Default;
