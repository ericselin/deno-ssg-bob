import type {
  Page,
  Context,
  Element,
  ElementCreator,
  ElementRenderer,
  ElementRendererCreator,
  Props,
} from "../domain.ts";

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

export const createRenderer: ElementRendererCreator = (_options, getPages) =>
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
            `layouts/${component.needsCss}`,
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
                  page.filepath.relativePath !==
                    context.page.filepath.relativePath
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
