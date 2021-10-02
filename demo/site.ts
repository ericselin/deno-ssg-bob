import type { ContentBase } from "../mod.ts";
import base from "./base.ts";

export type OnlyContent = ContentBase<undefined, "default">;
export type IndexContent = ContentBase<undefined, "index">;

export type Content = OnlyContent | IndexContent;

export default base;
