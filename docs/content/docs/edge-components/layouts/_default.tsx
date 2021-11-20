/** @jsx h */

import { h, EdgeElement } from "../../../../../mod.ts";
import type { Component } from "../../../../../mod.ts";
import UserAgent from "../edge/UserAgent.tsx";

const Page: Component = (_, ctx) => (
  <div>
    <h1>This is my site!</h1>
    <EdgeElement component={UserAgent}>
      <p>Not really sure which user agent you're using...</p>
    </EdgeElement>
    {ctx.page.content}
  </div>
);

export default Page;
