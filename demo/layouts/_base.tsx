/** @jsx h */

import { Component, h, readContents, getPath } from "../../mod.ts";

const baseCss = getPath(import.meta.url, "_base.css");

export const Base: Component<{ css?: string }> = async (
  { children, css },
) => (
  <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <title>Hi, I'm Eric | ericselin.dev</title>
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Source+Code+Pro:wght@400;700;900&display=swap"
        rel="stylesheet"
      />
      <style>
        {css && await readContents([baseCss, css])}
      </style>
    </head>

    <body>
      <header>
        <a href="/">e</a>
        <ul>
          <li>
            <a href="/blog/">Blog</a>
          </li>
          <li>
            <a href="/experiments/">Experiments</a>
          </li>
        </ul>
      </header>
      {children}
      <footer>
        There's no such thing as the cloud - it's just someone else's computer.
      </footer>
    </body>
  </html>
);