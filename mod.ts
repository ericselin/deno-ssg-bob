export type { Component, Props } from "./domain.ts";
import type { Page } from "./domain.ts";
export type { Page };
export { build } from "./core/api.ts";
export { serve } from "./core/server.ts";
export { h } from "./core/jsx.ts";
export * from "./utils/get-path.ts";
export * from "./utils/read-contents.ts";
export * from "./utils/sort-date.ts";

// These types will be removed in the next breaking release
/** DEPRECATED: use `Page` type instead */
type ContentBase<T> = Page<T>;
/** DEPRECATED: use `Page` type instead */
type ContentUnknown = Page;
export type { ContentBase, ContentUnknown };
