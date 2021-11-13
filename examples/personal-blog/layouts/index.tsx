/** @jsx h */

import { Component, h } from "./deps.ts";
import { Base } from "./_base.tsx";

const Index: Component = (
  _props,
  {page: {content}}
) => (
  <Base>
    <section class="hero">
      <h1>
        Hi, I'm <span>Eric</span>
      </h1>
      <h2>I'm a developer.</h2>
    </section>

    <main>
      {content}
    </main>
  </Base>
);

Index.needsCss = "index.css";

export default Index;
