/** @jsx h */
/// <reference no-default-lib="true"/>
/// <reference lib="es2020" />
/// <reference lib="deno.ns" />

import { h } from "https://x.lcas.dev/preact@10.5.12/mod.js";
import { renderToString } from "https://x.lcas.dev/preact@10.5.12/ssr.js";
import type { ContentBase, ContentRenderer } from "../../mod.ts";

export const Base = ({ children }: { children: string }) => {
  return (
    <div>
      <Component drugs={["rick", "morty"]} />
      <div dangerouslySetInnerHTML={{ __html: children }} />
    </div>
  );
};

const Component = (props: { drugs: string[] }) => {
  return (
    <div>
      {props.drugs.map((drug) => <div>{drug}</div>)}
    </div>
  );
};

type Content = ContentBase<undefined, undefined>;

export const render: ContentRenderer<Content> = (content) =>
  renderToString(
    <Base>
      {content.content}
    </Base>,
  );
