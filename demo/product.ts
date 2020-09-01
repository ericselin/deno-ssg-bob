import { ContentRenderer } from "../api.ts";
import { Product } from "./site.ts";

const product: ContentRenderer<Product> = (content) =>
  `
    this is the ${content.frontmatter.title} product
  `;
export default product;
