import type { Renderer } from "../domain.ts";

const renderer: Renderer = async ({ renderer, page }) => ({
  path: page.location.outputPath,
  output: await renderer(page),
});

export default renderer;
