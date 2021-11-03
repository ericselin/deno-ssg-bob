---
title: List pages
---

Most websites have list pages of some sort - lists of blog posts on a marketing site or lists products on an ecommerce site. In order to create these list pages, your layout needs to know about not only the list page itself, but also the pages that should be rendered into the list. In `bob` this can be solved by providing a glob of content files to use in the layout. This is done by setting the `wantsPages` parameter on the layout `Component`.

## Example

Given the below folder structure, we want to get all pages to show in a listing on the index / home page.

```
site root
└-- content
|   └-- index.md
|   └-- page-1.md
|   └-- page-2.md
|   └-- page-3.md
└-- layouts
    └-- index.tsx
```

In the index layout, we specify the glob `*.md`. This glob is relative to the `content` folder, and thus means "all markdown files in the content root".

The pages that match this glob are returned to the layout (or any component, really) in the `context` argument. These pages receive the complete `Page` objects for the wanted pages. This means you can use properties like `title`, `summary` and `location.url`. The context is the second argument to the `Component` (the first being `Props`).

code:layouts/index.tsx

> Beware: The `wantedPages` array currently does not include the page itself. This is by design (as you can guess from the example), but might change in the future.

## Result

iframe:expected/index.html

### Content

code:content/index.md

code:content/page-1.md
