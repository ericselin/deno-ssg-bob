---
title: Server functions
weight: 1
---

Cloud-hosted `bob` sites have the possibility to create server functions under any path. These functions are matched against a given `URLPattern` and will receive the incoming `Request` and accompanying `FunctionContext` and are expected to return a `Response`. The `FunctionContext` includes any pattern matches from the pathname, a `writeAndRender` function to replace a content file and render the page and any dependants, and an `updateAndRender` function to do a partial update of the content and render. 

To run your functions in a production, use the `bob functions` CLI command.

## Usage

Functions are defined in a `functions/index.ts` file. This file should export (default export) an array of tuples, where each tuple consists of a pathname pattern string and a request handler. The pathname pattern is matched against incoming requests with `URLPattern`, which means that you can use named path parameters. The matches are included in the function context as `pathnameParams`. Any additional url processing should be done in the handler itself.

## Example

code:functions/index.ts
