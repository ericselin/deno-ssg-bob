/** @jsx h */

import { Component, h } from "../../../../../mod.ts";

const C: Component = (
  _props,
  { page: { content, title } },
) => (
  <body>
    <h1>{title}</h1>
    {content}
  </body>
);

export default C;
