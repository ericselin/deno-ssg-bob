---
date: 2021-05-05
title: Cloudflare Wrangler has some quirks
tags:
- cloudflare
---

## Wrangler production log tail not working with AUR package

`wrangler tail`, awesome as it is, doesn't work with a default install of the `cloudflared` [AUR package](https://aur.archlinux.org/packages/cloudflared/#comment-798858). The solution is to delete the config file created by the AUR installer, [as pointed out on the package page](https://aur.archlinux.org/packages/cloudflared/#comment-776137).

## Building with a custom command doesn't watch on the root folder

Creating a "custom build command" for wrangler is great when working with Deno. And although there is a `watch_dir` config option, it doesn't seem to work with the root project dir, i.e. "." or similar. Watching works nicely when watching a subfolder, e.g. "src", though!

## GitHub action doesn't work with custom build commands

If you just install some stuff in a GitHub action (e.g. [`setup-deno`](https://github.com/denoland/setup-deno), that command is not available in [`wrangler-action`](https://github.com/cloudflare/wrangler-action). This is of course because the wrangler action runs inside a container (why?). The solution is of course to install the needed build tools in the `preCommands` step.

