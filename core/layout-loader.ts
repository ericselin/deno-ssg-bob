import type {
  BuildOptions,
  Component,
  DefaultProps,
  LayoutLoader,
  PagesGetter,
  RenderablePage,
} from "../domain.ts";
import { path } from "../deps.ts";
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
  try {
    // Construct a file URL in order to be able to load
    // local modules from remote scripts
    const fullPath = path.toFileUrl(
      path.join(Deno.cwd(), scriptPath),
    ).toString();
    return await import(fullPath);
  } catch (e) {
    if (e.message.startsWith("Cannot load module")) return undefined;
    throw e;
  }
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
  return async (page) => {
    const { layoutDir, log } = options;
    const { location: { inputPath }, frontmatter } = page;
    const contentPath = path.relative(options.contentDir, inputPath);

    let loadPaths: string[];

    if (frontmatter.layout) {
      loadPaths = [
        `${layoutDir}/${frontmatter.layout}`,
      ];
      log?.debug(
        `Layout for ${contentPath} set in frontmatter to ${frontmatter.layout}`,
      );
    } else {
      loadPaths = getLookupTable(contentPath, layoutDir);

      log?.debug(
        `Searching for layout for ${contentPath} in [\n${
          loadPaths.join("\n    ")
        }\n  ]`,
      );
    }

    const layout = await loadFirstLayout(loadPaths);

    if (!layout) {
      throw new Error(`Could not find layout for ${contentPath}`);
    }

    if (layout.type === "tsx") {
      log?.debug(`Rendering layout file '${layout.path}' as TSX`);
      return <RenderablePage> {
        page,
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
