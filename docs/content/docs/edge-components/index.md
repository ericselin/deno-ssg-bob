---
title: Edge components
---

By using edge components you can host HTML and deliver HTML, but still personalize pages or create other kinds of dynamic content. No need for either a server or client-side JavaScript. Just create your component in the same way as any other component and that component - and only that component - will be rendered dynamically at the network edge for every request.

> **Warning!**
>
> Only use edge components for content that should be changed based on the incoming request, e.g. showing the name of the logged in user. For content that doesn't depend on the request, such as inventory count, use incremental builds instead.

## Introduction

Edge components work by streaming the site through a proxy, and replacing only the needed parts of the page with newly rendered content. Everything that can be rendered into static HTML is rendered into static HTML. Not only is this way faster than rendering the entire page every time (or updating content via client-side JavaScript), it also means that even though the proxy completely blows up, the page will still work as a static page. Think of it as a form of progressive enhancement.

> **Tip!**
>
> Make sure the default (fallback) content in the edge component is something that makes sense without the proxy. If the edge rendering for some reason does not work, the page should still be usable.

The proxy itself is a [Cloudflare Worker](https://workers.cloudflare.com) that you host on your Cloudflare account. The Worker listens to requests for your site and renders and rewrites the needed parts of the page:

```
Hosting      Edge proxy      Client
HTML    -->  Rewrite    -->  HTML
```

## 0. Prerequisites

- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Cloudflare Workers CLI](https://developers.cloudflare.com/workers/cli-wrangler/install-update) `wrangler`

Make sure to [authenticate](https://developers.cloudflare.com/workers/cli-wrangler/authentication) `wrangler` before trying to upload your Worker script.

## 1. Create your edge component

The edge component itself should implement the `EdgeComponent` type. It is a special component that receives the incoming request as the `request` property. It also does not receive the page or context, because these are not available at the edge. Otherwise treat it like any other component, making async calls (such as fetches) or anything else as needed.

code:edge/UserAgent.tsx

## 2. Use edge component on your site

In order to render the markup needed for the `EdgeComponent` to run, create an `EdgeElement` and specify which edge component to use. (This is named "element" because it literally is rendered into an HTML element.) Add the default (fallback) content inside this element as needed. You are free to use any other components or markup here.

code:layouts/_default.tsx

## 3. Create Worker script

You will publish your edge component proxy with `wrangler`. First, create the worker script for the proxy. Just import the edge components you use and create an object out of those (use `Component.name` as the property name, since that is what the `EdgeElement` uses internally). Then create an edge request handler with the provided function. Export this function in a way expected by the Workers runtime.

code:edge/worker.ts

You need a configuration file for `wrangler` to work properly. See [wrangler documentation](https://developers.cloudflare.com/workers/cli-wrangler/configuration) for details. Just rember to add the build step (`deno bundle`), and remember that your worker is of the new ES module format.

code:wrangler.toml

This is just an example with the `bobsite.io` account and zone names. The route is set so that only the resulting page below invokes this worker.

## 4. Publish your Worker

When you are ready, and whenever you update your edge components, just run `wrangler publish` to publish a new version.

### Optional: Configure CI/CD for updating edge components

Whenever the files inside your `edge` directory changes, you should update your worker using `wrangler`. Do this on your preferred CI/CD provider.

## Result

iframe:expected/index.html
