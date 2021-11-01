---
title: Getting started
---

Define your layout(s) and write some content. It could not be easier to get going - it "just works".

## Introduction

bob uses TSX for templating, which lends itself very well for a modern workflow. Everything is fully typed via Typescript, and as modular as you like.

All of your content lives in the same folder, which mirrors your website structure. E.g. a `blog/post.md` content file gets the full URL `/blog/post/index.html`.

Example folder structure:

```
site root
└-- content
|   └-- index.md      <-- https://example.com/
|   └-- blog
|       └-- index.md  <-- https://example.com/blog/
|       └-- post.md   <-- https://example.com/blog/post/
└-- layouts
    └-- _default.tsx  <-- default layout file
    └-- index.tsx     <-- layout file for index.md
```

Each content file is rendered independently using a layout file based on a layout file lookup order. There is no other magic involved - no base layouts, no partials and nothing like that. However, by importing other layouts and components using stardard ES6 imports, you can create even the most complex layouts. See below!

## 1. Define your layout(s)

In the `layouts` directory, create a `_default.tsx` file with the below contents. This is the default layout file used.

`layouts/_default.tsx`

```tsx
/** @jsx h */

import { ContentComponent, h } from "mod.ts";
import { Base } from "./_base.tsx";

const Default: ContentComponent = (props) => (
  <Base {...props}>
    <main>
      {props.content}
    </main>
  </Base>
);

export default Default;
```

The above default layout uses the `Base` component, which in our case holds the main HTML skeleton. This is not a requirement by the engine - structuring your layouts is completely up to you! Below is the base component. Note that while `bob` requires you to export layouts as default, components (such as the base) can be consumed in any way. Here we have opted for a named export.

`layouts/_base.tsx`

```tsx
/** @jsx h */

import { ContentComponent, h } from "mod.ts";

export const Base: ContentComponent = (props) => (
  <html>
    <head>
      <title>This is my new site!</title>
    </head>
    <body>
      <header>
        <a href="/">Home</a>
      </header>
      {props.children}
    </body>
  </html>
);
```

You can see that we have used `children` in the same way React and React-like libraries do. This is probably a good time to mention the [jsx pragma comment](https://www.typescriptlang.org/tsconfig#jsx) used to inform the Typescript compiler that we want to use the imported `h` function for creating JSX elements.

If you want, create a layout file specific for the root index page.

`layouts/index.tsx`

```tsx
/** @jsx h */

import { ContentComponent, h } from "mod.ts";
import { Base } from "./_base.tsx";

const Index: ContentComponent = (props) => (
  <Base {...props}>
    <section>
      <h1>Welcome, welcome</h1>
      <p>
        I wanted to create a better hero
        element, but here we are...
      </p>
    </section>
    <main>
      {props.content}
    </main>
  </Base>
);

export default Index;
```

## 2. Create some content

Creating content is really up to you! But you can of course use the following as a starting point:

`content/index.md`

```md
# Awesome new site

This site is based on
[bob](https://github.com/ericselin/deno-ssg-bob).
You should check it out too!
```

Please create (or copy over!) more content and make something awesome 😎.
