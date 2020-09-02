import { ContentRenderer } from "../mod.ts";
import { IndexContent } from "./site.ts";

const product: ContentRenderer<IndexContent> = (content) =>
  `
<section class="hero">
  <h1>Hi, I'm <span>Bob</span></h1>
  <h2>and I'm a static site builder.</h2>
</section>
<div class="box"></div>

<main>
  ${content.content}
</main>
`;
export default product;
