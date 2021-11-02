/** @jsx h */

import { Component, h } from "../../../../../mod.ts";
import { Base } from "./_base.tsx";

const Index: Component = (
  _props,
  { page: { content } }
) => (
  <Base>
    <section>
      <h1>Welcome, welcome</h1>
      <p>
        I wanted to create a better hero
        element, but here we are...
      </p>
    </section>
    <main>
      {content}
    </main>
  </Base>
);

export default Index;
