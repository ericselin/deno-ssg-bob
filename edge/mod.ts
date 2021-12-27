import "https://deno.land/x/worker_types@v1.0.1/cloudflare-worker-types.ts";
// importing domain to get JSX.IntrinsicElements in scope
import "../domain.ts";

export interface EdgeComponent<P extends Props = Record<string, never>> {
  (props: P, req: Request): EdgeElement | Promise<EdgeElement>;
  preBody? (req: Request, res: Response): void | Response | Promise<void | Response>;
}

type Props = Record<string, unknown>;
type EdgeRenderer = (
  element: Children | Promise<Children>,
) => Promise<Html>;
type Html = string;
type EdgeElement<P extends Props = Props> = {
  type: ElementType;
  props?: P;
  children?: Children[];
};
type ElementType = EdgeComponent<Props> | string;
type Child = EdgeElement | string;
type Children = Child | Child[];
type ElementCreator = (
  type: ElementType,
  props?: Props,
  ...children: Children[]
) => EdgeElement;

const renderProps = (props?: Props): string => {
  if (!props) return "";
  return Object.entries(props).reduce(
    (all, [attr, value]) => `${all} ${attr}="${value}"`,
    "",
  );
};

export const h: ElementCreator = (type, props, ...children) => ({
  type,
  props,
  children,
});

const createRenderer = (req: Request): EdgeRenderer => {
  const render: EdgeRenderer = async (element) => {
    let html = "";

    element = await element;

    if (!element) return "";

    if (typeof element === "string") {
      return element;
    }

    if ("length" in element) {
      for (const el of element) {
        html += await render(el);
      }
      return html;
    }

    if (typeof element.type !== "string") {
      const props = element.props || {};
      props.children = element.children;
      element = await element.type(props, req);
      return render(element);
    }

    const { type, props, children } = element;

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

const createRewriter = (components: Record<string, EdgeComponent>) =>
  (req: Request): ElementHandler => ({
    element: async (el) => {
      try {
        const src = el.getAttribute("src");
        if (!src) {
          throw new Error("Edge component `src` attribute not set");
        }
        const props = new Proxy({}, {
          get: (_target, prop) => el.getAttribute(prop as string),
        });
        const component = components[src];
        const element = await component(props, req);
        element.props = props;
        const render = createRenderer(req);
        const html = await render(element);
        html && el.replace(html, { html: true });
      } catch (ex) {
        console.log("Could not render edge component", ex.toString());
      }
    },
  });

export const edgeRequestHandler = (
  components: Record<string, EdgeComponent>,
  originHost?: string,
) =>
  async (request: Request): Promise<Response> => {
    if (originHost) {
      const url = new URL(request.url);
      url.host = originHost;
      request = new Request(url.toString(), request);
    }
    let res = await fetch(request);
    Object.values(components).forEach(c => {
      if (c.preBody) {
        res = new Response(res.body, res);
        c.preBody(request, res);
      }
    });
    return new HTMLRewriter().on(
      "edge-component",
      createRewriter(components)(request),
    ).transform(
      res,
    );
  };
