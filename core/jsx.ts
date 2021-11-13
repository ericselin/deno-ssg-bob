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
  Page,
  Context,
  Element,
  ElementCreator,
  ElementRenderer,
  ElementRendererCreator,
  Props,
} from "../domain.ts";
import { path } from "../deps.ts";

export const h: ElementCreator = (type, props, ...children) => {
  const element: Element = { type, props, children };
  if (typeof type !== "string") {
    element.wantsPages = type.wantsPages;
    element.needsCss = type.needsCss;
  }
  return element;
};

const renderProps = (props?: Props): string => {
  if (!props) return "";
  return Object.entries(props).reduce(
    (all, [attr, value]) => `${all} ${attr}="${value}"`,
    "",
  );
};

export const createRenderer: ElementRendererCreator = (options, getPages) =>
  (contentPage) => {
    const renderContext = {
      needsCss: [] as string[],
    };
    const render: ElementRenderer = async (component) => {
      let html = "";

      component = await component;

      if (!component) return "";

      if (typeof component === "string") {
        return component;
      }

      if ("length" in component) {
        for (const c of component) {
          html += await render(c);
        }
        return html;
      }

      if (typeof component.type !== "string") {
        const props = component.props || {};
        props.children = component.children;
        if (component.needsCss) {
          renderContext.needsCss = [
            ...renderContext.needsCss,
            path.join(options.layoutDir, component.needsCss),
          ];
        }
        const context: Context = {
          page: contentPage as Page,
          needsCss: renderContext.needsCss,
        };
        if (component.wantsPages) {
          context.wantedPages = getPages &&
            // get all wanted pages
            await getPages(component.wantsPages)
              .then((wantedPages) =>
                // filter out the current page from wanted pages
                wantedPages.filter((page) =>
                  page.location.inputPath !==
                    context.page.location.inputPath
                )
              );
        }
        component = await component.type(props, context);
        return render(component);
      }

      const { type, props, children } = component;

      html += `<${type}${renderProps(props)}>`;

      if (children) {
        for (const child of children) {
          html += await render(child);
        }
      }

      html += `</${type}>`;

      return html;
    };
    return render;
  };
