/** @jsx h */

import { Component, Page, h } from "./deps.ts";

export const Summary: Component<{ post: Page<{ title: string }> }> = (
  { post: { location: { url }, title, date, summary } },
) => (
  <article>
    <header>
      <h2>
        <a href={url.pathname}>{title}</a>
      </h2>
      <i>{date && date.toDateString()}</i>
    </header>
    <p>
      {summary}
    </p>
    <footer>
      <a href={url.pathname}>
        <nobr>Read more →</nobr>
      </a>
    </footer>
  </article>
);
