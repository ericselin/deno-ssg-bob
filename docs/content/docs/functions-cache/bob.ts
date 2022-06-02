import { bob, ConfigFile } from "../../../../mod.ts";

const config: ConfigFile = {
  functions: [
    [
      "/",
      () => new Response(`dynamic at ${new Date().toISOString()}`),
    ],
    [
      "/cached/",
      () =>
        new Response(`cached at ${new Date().toISOString()}`, {
          headers: { "Content-Type": "text/html" },
        }),
      { cache: true },
    ],
  ],
};

if (import.meta.main) {
  const app = await bob(config);

  if (app.cacheUrl) {
    console.log("Initial caching import here");
    setInterval(() => {
      if (app.cacheUrl) {
        app.cacheUrl("/cached/");
      }
    }, 5000);
  }
}
