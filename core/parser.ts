/*
Copyright 2021 Eric Selin

This file is part of `bob`.

`bob` is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

`bob` is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with `bob`. If not, see <https://www.gnu.org/licenses/>.

Please contact the developers via GitHub <https://www.github.com/ericselin>
or email eric.selin@gmail.com <mailto:eric.selin@gmail.com>
*/

import type { BuildOptions, Page, Html, Parser } from "../domain.ts";
import { ContentType } from "../domain.ts";
import { md, yaml } from "../deps.ts";

type RawFrontmatter = string;
type RawContent = string;

type FrontmatterParser = (
  frontmatter: RawFrontmatter,
) => unknown;
type ContentParser = (content: RawContent) => Html;

const markdownParser = (str: string): string => md.parse(str).content;

export const getContentFileParser = (
  parseContent: ContentParser,
  parseFrontmatter: FrontmatterParser,
) =>
  ({ log }: BuildOptions): Parser =>
    (contentFile) => {
      const contentSplit = contentFile.content.split("\n---\n");
      const rawContent = contentSplit.pop() || "";
      const rawFrontmatter = contentSplit.pop() || "";
      const frontmatter = parseFrontmatter(rawFrontmatter) as
        | Record<string, unknown>
        | undefined;

      const content: Page = {
        type: ContentType.Page,
        location: contentFile.location,
        frontmatter: frontmatter || {},
        content: parseContent(rawContent),
        get summary() {
          // here we're assuming `content` is HTML
          let summary = this.content
            // get first 500 characters
            .substr(0, 500)
            // strip html tags
            .replace(/<[^>]*>?/g, "")
            // replace newlines with space
            .replace(/\n+/g, " ");
          // if we have sentences, remove the last (partial) sentence
          if (summary.includes(".")) {
            summary = summary.split(".").slice(0, -1).join(".").concat(".");
          }
          // return without whitespace
          return summary.trim();
        },
      };

      if (frontmatter?.title) content.title = frontmatter.title as string;

      if (frontmatter?.date) {
        try {
          content.date = new Date(frontmatter.date as string);
        } catch (e) {
          log?.warning(
            `Could not parse date "${frontmatter.date}" in \`${contentFile.location.inputPath}\``,
          );
          log?.debug(e.toString());
        }
      }

      return content;
    };

export default getContentFileParser(markdownParser, yaml.parse);
