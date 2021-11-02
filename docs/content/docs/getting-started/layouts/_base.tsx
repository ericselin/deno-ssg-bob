/** @jsx h */

import { Component, h } from "../../../../../mod.ts";

export const Base: Component = (props) => (
  <html>
    <head>
      <title>This is my new site!</title>
    </head>
    <body>
      <header>
        Main header
      </header>
      {props.children}
    </body>
  </html>
);
