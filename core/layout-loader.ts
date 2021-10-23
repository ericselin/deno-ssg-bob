import type {
  BuildOptions,
  Component,
  DefaultProps,
  LayoutLoader,
  PagesGetter,
  RenderableContent,
} from "../domain.ts";
import { exists, path } from "../deps.ts";
import { createRenderer, h } from "./jsx.ts";

type LayoutModuleBase<t, T> = {
  module: {
    default: T;
  };
  type: t;
  path: string;
};
type LayoutModuleTsx = LayoutModuleBase<"tsx", Component | Promise<Component>>;
type LayoutModuleUnknown = LayoutModuleBase<"unknown", unknown>;
type LayoutModule =
  | LayoutModuleTsx
  | LayoutModuleUnknown
  | undefined;

const loadIfExists = async (scriptPath: string) => {
  const fullPath = path.join(Deno.cwd(), scriptPath);
  if (await exists(fullPath)) return import(fullPath);
};

const loadFirstLayout = async (
  scriptPaths: string[],
): Promise<LayoutModule> => {
  if (!scriptPaths.length) return undefined;
  const currentPath = scriptPaths[0];
  const module = await loadIfExists(currentPath);
  if (!module) return loadFirstLayout(scriptPaths.slice(1));
  const props = { module, path: currentPath };
  switch (path.extname(currentPath)) {
    case ".tsx":
      return { ...props, type: "tsx" };
    default:
      return { ...props, type: "unknown" };
  }
};

export const getLookupTable = (contentPath: string, layoutDir: string) => {
  const { dir: contentDir, name: contentName } = path.parse(contentPath);
  const contentDirSegments = contentDir ? contentDir.split(path.sep) : [];
  const defaultLayouts = [""].concat(contentDirSegments)
    .map((_dir, i, dirs) => path.join(...dirs.slice(0, i + 1)))
    .map((dir) => path.join(dir, "_default.tsx"))
    .reverse();
  const namedLayout = path.join(
    contentDir,
    contentName + ".tsx",
  );

  const lookup: string[] = [
    namedLayout,
    ...defaultLayouts,
  ].map((relativePath) => path.join(layoutDir, relativePath));

  return lookup;
};

const loadLayout = (
  options: BuildOptions,
  getPages: PagesGetter,
): LayoutLoader => {
  const renderJsx = createRenderer(options, getPages);
  return async (content) => {
    const { layoutDir, log } = options;
    const { filepath: { relativePath: contentPath } } = content;

    const lookup = getLookupTable(contentPath, layoutDir);

    log?.debug(`Searching for layout for ${contentPath} in [
    ${lookup.join("\n    ")}\n  ]`);

    const layout = await loadFirstLayout(lookup);
    if (!layout) {
      throw new Error(`Could not find layout for ${contentPath}`);
    }

    if (layout.type === "tsx") {
      log?.debug(`Rendering layout file '${layout.path}' as TSX`);
      return <RenderableContent> {
        content,
        renderer: (content) =>
          renderJsx(content)(
            h(
              layout.module.default as Component<
                DefaultProps,
                unknown,
                unknown
              >,
            ),
          ),
      };
    } else {
      throw new Error(`Unknown layout type '${layout.path}'`);
    }
  };
};

export default loadLayout;
