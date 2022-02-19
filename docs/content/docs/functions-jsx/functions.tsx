/** @jsx h */

import { Component, FunctionHandler, Functions, h } from "../../../../mod.ts";

const Base: Component = (props, { page }) => (
  <html>
    <head>
      <title>{page.title || "Hello world"}</title>
    </head>
    <body>
      {props.children}
    </body>
  </html>
);

const Root: Component<{ greetings: string[] }> = ({ greetings }) => (
  <Base>
    Greetings to: {greetings.length ? greetings.join() : "Nobody :("}
  </Base>
);

const rootHandler: FunctionHandler = (_req, ctx) => {
  return ctx.renderResponse(Root, { greetings: ["moi"] });
};

const functions: Functions = [
  ["/", rootHandler],
];

export default functions;
