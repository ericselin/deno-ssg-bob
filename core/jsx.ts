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

import type {
  Component,
  Context,
  Element,
  ElementCreator,
  ElementRenderer,
  ElementRendererCreator,
  Location,
  Page,
  Props,
} from "../domain.ts";
import { HTMLEmptyElements } from "../domain.ts";
import { path } from "../deps.ts";

export const h: ElementCreator = (type, props, ...children) => {
  const element: Element = { type, props, children };
  if (typeof type !== "string") {
    element.wantsPages = type.wantsPages;
    element.needsCss = type.needsCss;
  }
  return element;
};

const renderProps = (props?: unknown): string => {
  if (!props || typeof props !== "object") return "";
  return Object.entries(props).reduce(
    (all, [attr, value]) => `${all} ${attr}="${value}"`,
    "",
  );
};

const _shouldHaveChildPages = ({ contentPath }: Location) =>
  contentPath.split(path.sep).pop() === "index.md";

const _getChildPagesGlobs = ({ contentPath }: Location): string[] => {
  const contentDir = path.dirname(contentPath);
  return [`${contentDir}/!(index).md`, `${contentDir}/*/index.md`];
};

export const createRenderer: ElementRendererCreator = (options, getPages) =>
  (contentPage) => {
    const renderContext = {
      needsCss: [] as string[],
    };
    const { log } = options;
    const render: ElementRenderer = async (element) => {
      let html = "";

      element = await element;

      // if this is an array, render recursively
      if (Array.isArray(element)) {
        for (const c of element) {
          html += await render(c);
        }
        return html;
      }

      if (element === null) {
        return "";
      }

      switch (typeof element) {
        case "undefined":
          return "";
        case "string":
          return element;
        case "number":
        case "boolean":
          return element.toString();
      }

      // see if this is an html tag
      if (typeof element.type === "string") {
        const { type, props, children } = element;

        html += `<${type}${renderProps(props)}>`;

        // if this is an "empty element", don't render children or end tag
        if (HTMLEmptyElements.includes(type)) {
          children && children.length &&
            options.log?.error(
              `HTML element ${type} on page ${
                contentPage?.location.inputPath
              } should not have children!`,
            );
          return html;
        }

        if (children) {
          for (const child of children) {
            html += await render(child);
          }
        }

        html += `</${type}>`;

        return html;
      }

      // if we get here, the element should be an actual renderable jsx component

      const props = element.props as Props || {};
      props.children = element.children;
      if (element.needsCss) {
        renderContext.needsCss = [
          ...renderContext.needsCss,
          path.join(options.layoutDir, element.needsCss),
        ];
      }
      const context: Context<unknown, unknown, unknown> = {
        page: contentPage as Page,
        needsCss: renderContext.needsCss,
        get childPages() {
          if (getPages && _shouldHaveChildPages(this.page.location)) {
            return getPages(_getChildPagesGlobs(this.page.location));
          }
          return undefined;
        },
      };
      // TODO DEPRECATED
      if (element.wantsPages) {
        log?.warning("DEPRECATED: `wantedPages`");
        context.wantedPages = getPages &&
          // get all wanted pages
          await getPages(element.wantsPages)
            .then((wantedPages) =>
              // filter out the current page from wanted pages
              wantedPages.filter((page) =>
                page.location.inputPath !==
                  context.page.location.inputPath
              )
            );
      }

      try {
        const component = element.type as Component<
          unknown,
          unknown,
          unknown,
          unknown
        >;
        element = await component(props, context);
        return render(element);
      } catch (e) {
        options.log?.error(
          `Error rendering page ${contentPage?.location.inputPath}`,
        );
        options.log?.error(
          `Content page: ${JSON.stringify(contentPage, undefined, 2)}`,
        );
        throw e;
      }
    };
    return render;
  };
