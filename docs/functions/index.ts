import type { FunctionHandler } from "../../mod.ts";

const helloHandler: FunctionHandler = (_req) => new Response("Hello world");
const testHandler: FunctionHandler = (_req, ctx) => {
  return new Response(`You requested test in folder ${ctx.pathnameParams.dir}`);
};

const writerHandler: FunctionHandler = async (req, ctx) => {
  const contents = new URL(req.url).searchParams.get("c");
  // update contents e.g. writeContentFile(relativePath, contents: string)
  await ctx.writeAndRender("test", contents || "[empty]");
  // send response
  return new Response("Redirecting...", {
    status: 302,
    headers: { Location: "/test" },
  });
};

export default [
  ["/hello", helloHandler],
  ["/:dir/test", testHandler],
  ["/write", writerHandler],
];
