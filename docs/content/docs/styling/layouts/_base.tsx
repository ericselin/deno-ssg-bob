/** @jsx h */

import { Component, h, readContents } from "../../../../../mod.ts";

export const Base: Component = async (
  { children },
  { needsCss },
) => (
  <html lang="en">
    <head>
      <title>This is my page</title>
      <style>
        {await readContents(needsCss)}
      </style>
    </head>
    <body>
      {children}
    </body>
  </html>
);

// Tip! You can add CSS files to any component, also this one
Base.needsCss = "_base.css";
