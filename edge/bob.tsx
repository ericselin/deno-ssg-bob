/** @jsx h */

import type { Component, EdgeComponent } from "../mod.ts";
import { h } from "../mod.ts";

export const EdgeElement: Component<{ component: EdgeComponent }> = (
  { component, children, ...props },
) => (
  <edge-component src={component.name} {...props}>
    {children}
  </edge-component>
);
