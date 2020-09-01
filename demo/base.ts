import { ContentRenderer, ContentBase } from "../api.ts";
import { Content, Product } from "./site.ts";
import product from "./product.ts";

const layout = (content: Content) => {
  switch (content.type) {
    case "product":
      return product(content);
    default:
      return content.content;
  }
};

const base: ContentRenderer<Content> = (content) =>
  `
<h1>hello from base</h1>
${layout(content)}
`;
export default base;
