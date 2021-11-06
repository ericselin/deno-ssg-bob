/** @jsx h */

import { Component, h } from "../../mod.ts";
import { Base } from "./_base.tsx";

const Index: Component = (
  _props,
  {page: {content}}
) => (
  <Base>
    <section class="hero">
      <h1>
        <span>bob</span> the static site builder
      </h1>
      <h2>A static site generator for the dynamic web</h2>
    </section>

    <main>
      {content}
    </main>
  </Base>
);

Index.needsCss = "index.css";

export default Index;
