/** @jsx h */

import { Component, ContentBase, getPath, h } from "../../mod.ts";
import { Base } from "./_default/baseof.tsx";

const Index: Component<ContentBase<undefined, undefined>> = (
  props,
) => (
  <Base css={getPath(import.meta.url, "index.css")} {...props}>
    <section class="hero">
      <h1>
        Hi, I'm <span>Eric</span>
      </h1>
      <h2>I'm a developer.</h2>
    </section>

    <main>
      {props.content}
    </main>
  </Base>
);

export default Index;
