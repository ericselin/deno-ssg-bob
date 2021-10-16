/** @jsx h */

import { getPath, h, Layout } from "../../mod.ts";
import { Base } from "./_base.tsx";

const Index: Layout<undefined, undefined> = (
  props,
) => (
  <Base css={getPath(import.meta.url, "index.css")} {...props}>
    <section class="hero">
      <h1>
        <span>bob</span> the static site builder
      </h1>
      <h2>Extremely fast content updating</h2>
    </section>

    <main>
      {props.content}
    </main>
  </Base>
);

export default Index;
