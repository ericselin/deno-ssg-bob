/** @jsx h */

import { Component, h, readContents } from "./deps.ts";

export const Base: Component = async (
  { children },
  { page, needsCss },
) => (
  <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <title>{(page.frontmatter as any).title || "I'm Eric, and I'm a developer"} | ericselin.dev</title>
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Source+Code+Pro:wght@400;700;900&display=swap"
        rel="stylesheet"
      />
      <style>
        {await readContents(needsCss)}
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

Base.needsCss = "_base.css";
