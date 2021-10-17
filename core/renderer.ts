import type { Renderer } from "../domain.ts";

const renderer: Renderer = async ({ renderer, content }) => ({
  path: content.filepath.outputPath,
  output: await renderer(content),
});

export default renderer;
