import type { FunctionHandler } from "../../mod.ts";

const helloHandler: FunctionHandler = (_req) => new Response("Hello world");
const testHandler: FunctionHandler = (_req, ctx) => {
  return new Response(`You requested test in folder ${ctx.pathnameParams.dir}`);
};

export default [
  ["/hello", helloHandler],
  ["/:dir/test", testHandler],
];
