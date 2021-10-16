import type { ElementCreator, ElementRenderer, Props } from "../domain.ts";

export const h: ElementCreator = (type, props, ...children) => {
  return { type, props, children };
};

const renderProps = (props?: Props): string => {
  if (!props) return "";
  return Object.entries(props).reduce(
    (all, [attr, value]) => `${all} ${attr}="${value}"`,
    "",
  );
};

export const render: ElementRenderer = async (component) => {
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

  if (typeof component.type === "function") {
    const props = component.props || {};
    props.children = component.children;
    component = await component.type(props);
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
