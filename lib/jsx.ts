export type Component<T = unknown> = (
  props: T & { children?: Children[] },
) => Element | Promise<Element>;

type Element<P extends Record<string, unknown> = Record<string, unknown>> = {
  type: Component | string | Promise<Component | string>;
  props?: P;
  children?: Children[];
};

type Child = Element | string;
type Children = Child | Child[];

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: unknown;
    }
  }
}

export const h = (
  type: Component | string | Promise<Component | string>,
  props?: Record<string, unknown>,
  ...children: Children[]
): Element => {
  return { type, props, children };
};

const renderProps = (props?: Record<string, unknown> | null): string => {
  if (!props) return "";
  return Object.entries(props).reduce(
    (all, [attr, value]) => `${all} ${attr}="${value}"`,
    "",
  );
};

export const render = async (
  component: Children | Promise<Children>,
): Promise<string> => {
  let html = "";

  component = await component;

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
