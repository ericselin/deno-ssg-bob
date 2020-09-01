import build, { ContentBase } from "../api.ts";
import base from "./base.ts";

export type OnlyContent = ContentBase<undefined, "default">;
export type Product = ContentBase<{
  type: "product";
  title: string;
}, "product">;

export type Content = OnlyContent | Product;

await build<Content>(["content"], base);
