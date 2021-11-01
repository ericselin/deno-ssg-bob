/** @jsx h */

import { Component, h } from "../../../mod.ts";
import { exists, path } from "../../../deps.ts";
import { Base } from "../_base.tsx";

// TODO make this a library function?
const htmlEncode = (html: string): string =>
  html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const FileCode: Component<{ name: string; contents: string }> = (
  { name, contents },
) => (
  <p>
    <code>{name}</code>
    <pre>
      <code>{htmlEncode(contents)}</code>
    </pre>
  </p>
);

const LayoutDirContents: Component = async (
  _props,
  { page: { location: { inputPath } } },
) => {
  const dir = path.dirname(inputPath);
  const layoutDir = path.join(dir, "layouts");
  if (await exists(layoutDir)) {
    const files: { name: string; path: string }[] = [];
    for await (const dirEntry of Deno.readDir(layoutDir)) {
      files.push({
        name: `layouts/${dirEntry.name}`,
        path: path.join(layoutDir, dirEntry.name),
      });
    }
    const filesWithContent = await Promise.all(files
      .map(async (file) => ({
        ...file,
        contents: await Deno.readTextFile(file.path),
      })));
    return filesWithContent.map((file) => (
      <FileCode name={file.name} contents={file.contents} />
    ));
  }
  return <p>No example :(</p>;
};

const Scenarios: Component<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>
> = (
  _props,
  { wantedPages, page },
) => {
  // TODO remove this workaround once wantedPages are no longer filtered for current
  const pages = (wantedPages || []).concat(page).sort((a, b) => {
    return (a.title || "") > (b.title || "") ? 1 : -1;
  });

  return (
    <Base>
      <nav>
        <ul>
          {pages.map((child) => (
            <li>
              <a
                href={child.location.url.pathname}
                {...(child === page ? { "aria-current": "page" } : undefined)}
              >
                {child.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {page.frontmatter.title && <h1>{page.frontmatter.title}</h1>}
      <main>
        {page.content}
        <LayoutDirContents />
      </main>
    </Base>
  );
};

Scenarios.needsCss = "docs/_default.css";
Scenarios.wantsPages = "docs/**/*.md";

export default Scenarios;
