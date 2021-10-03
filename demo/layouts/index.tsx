/** @jsx h */
/** @jsxFrag Fragment */

import { ContentBase, Component } from "../../mod.ts";
import { h } from "https://x.lcas.dev/preact@10.5.12/mod.js";
import { Base } from "./_default/baseof.tsx";

const Index: Component<ContentBase<undefined, undefined>> = (props) => (
  <Base {...props}>
    <section class="hero">
      <h1>
        Hi, I'm <span>Eric</span>
      </h1>
      <h2>I'm a developer.</h2>
    </section>

    <main dangerouslySetInnerHTML={{ __html: props.content }} />
  </Base>
);

export default Index;
