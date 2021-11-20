/** @jsx h */

import { Component, h, sortWeightAsc } from "../../../mod.ts";
import { path } from "../../../deps.ts";
import { Base } from "../_base.tsx";

// TODO make this a library function?
const htmlEncode = (html: string): string =>
  html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const codeBlock = (filename: string, rawCode: string): string =>
  `<code>${filename}</code><pre><code>${htmlEncode(rawCode)}</code></pre>`;

const iframe = (filename: string): string =>
  `<code>${filename}</code><iframe src="${filename}"></iframe>`;

const replaceFilepathsWithContent = (inputPath: string) =>
  (html: string): Promise<string> =>
    // This promise chain will resolve to a string
    Promise.all(
      // First await array of promises that resolve to the special match type
      [...html.matchAll(/(code|iframe):([^\s<]+)/g)].map(async (
        [matchedStr, type, filepath],
      ) => ({
        type,
        // Don't load file contents for iframe
        content: type === "iframe" ? undefined : await Deno.readTextFile(
          path.join(path.dirname(inputPath), filepath),
        ),
        filepath,
        matchedStr,
      })),
      // The matches here is an array of objects as per above
    ).then((matches) =>
      // Reduce matches to a string
      matches.reduce(
        // `replacedHtml` is the reduced value, `match` is an object of the type from above
        (replacedHtml, match) => {
          switch (match.type) {
            case "code":
              if (!match.content) {
                throw new Error(`No content for file ${match.filepath}`);
              }
              return replacedHtml.replace(
                match.matchedStr,
                codeBlock(match.filepath, match.content),
              );
            case "iframe":
              return replacedHtml.replace(
                match.matchedStr,
                iframe(match.filepath),
              );
            default:
              return replacedHtml;
          }
        },
        // Start with the initial passed-in html
        html,
      )
    );

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
          {pages.sort(sortWeightAsc).map((child) => (
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
        {replaceFilepathsWithContent(page.location.inputPath)(page.content)}
      </main>
    </Base>
  );
};

Scenarios.needsCss = "docs/_default.css";
Scenarios.wantsPages = "docs/*/*.md";

export default Scenarios;
