/** @jsx h */

import { getPath, h, Layout, readContents } from "../../mod.ts";

const baseCss = getPath(import.meta.url, "_base.css");

export const Base: Layout<{ css?: string }> = async (
  { children, css },
) => (
  <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <title>bob the static site builder</title>
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Source+Code+Pro:wght@400;700;900&display=swap"
        rel="stylesheet"
      />
      <style>
        {await readContents([baseCss, css])}
      </style>
    </head>

    <body>
      <header>
        <a href="/">bob</a>
        <ul>
          <li>
            <a href="/getting-started/">Getting started</a>
          </li>
          <li>
            <a href="/scenarios/">Common scenarios</a>
          </li>
        </ul>
      </header>
      {children}
      <footer>
        Static sites should be fast, including updating content
      </footer>
    </body>
  </html>
);
