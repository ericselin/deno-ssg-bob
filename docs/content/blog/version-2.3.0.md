---
title: 'v2.3.0 - Incremental builds and server functions'
date: 2022-02-03
---

This new version of `bob` is an exciting one!

## Incemental builds are feature-complete

Updating a content page now triggers re-renders of all dependant pages, and creating or deleting a content page work as expected. For instance, creating this blog post will re-render the blog index page correctly, as does modifying it later on. Deletions do the same, as well as clean up any redundant cache entries and such. There are still some kinks (e.g. in server mode), and it hasn't been tested to the max, so the build warning about incremental builds being experimental is still in place. But we are now extremely close to delivering on a critical promise!

## Server functions

You can now define server functions under any URL pattern, run them in development in server mode (`bob server`) and in production with `bob functions`. See [the documentation](/docs/functions/) for details. This is also a very important feature that further enables bob sites to have a dynamic nature even though the site itself is purely static! The API will probably change in an upcoming major release, and the documentation is still sparse, but stay tuned. Server functions are already being used in production, though. 🥳
