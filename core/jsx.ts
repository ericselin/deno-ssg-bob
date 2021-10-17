import type {
  Element,
  ElementCreator,
  ElementRenderer,
  Props,
  WantedPages,
} from "../domain.ts";

export const h: ElementCreator = (type, props, ...children) => {
  const element: Element = { type, props, children };
  if (typeof type !== "string") {
    element.wantsPages = type.wantsPages;
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

export const render: ElementRenderer = async (component, getPages, options) => {
  let html = "";

  component = await component;

  if (!component) return "";

  if (typeof component === "string") {
    return component;
  }

  if ("length" in component) {
    for (const c of component) {
      html += await render(c, getPages, options);
    }
    return html;
  }

  if (typeof component.type === "function") {
    const props = component.props || {};
    props.children = component.children;
    let wantedPages: WantedPages | undefined = undefined;
    if (component.wantsPages) {
      wantedPages = await getPages(component.wantsPages);
    }
    component = await component.type(props, wantedPages);
    return render(component, getPages, options);
  }

  const { type, props, children } = component;

  html += `<${type}${renderProps(props)}>`;

  if (children) {
    for (const child of children) {
      html += await render(child, getPages, options);
    }
  }

  html += `</${type}>`;

  return html;
};
