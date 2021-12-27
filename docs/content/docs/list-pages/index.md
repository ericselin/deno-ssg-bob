---
title: List pages
---

Most websites have list pages of some sort - lists of blog posts on a marketing site or lists products on an ecommerce site. In order to create these list pages, your layout needs to know about not only the list page itself, but also the pages that should be rendered into the list. In `bob` you have a couple of options to achive this:

- Use the `childPages` property on `Context`

    If the content page that is rendered is an index page (i.e. `index.md`), the page context will include the `childPages` property. This returns a promise of a page array (`Promise<Page[]>`). The pages returned are the immediate child pages of the index page in question.

- Use the `wantedPages` property on the layout page (`Component`)

    If a layout page will always need the same content pages, you can specify any glob of content pages on the layout page. This is done by setting the `wantsPages` parameter on the layout `Component`.

> Remember to set the correct type for your layout component. The signature of the (generic) type is `Component<Props, ContentPage, WantedPages, ChildPages>`.


## Example project structure


Given the below folder structure, we want to get all pages to show in a listing on the index / home page.

```
site root
└-- content
|   └-- index.md
|   └-- list.md
|   └-- page-1.md
|   └-- page-2.md
|   └-- page-3.md
└-- layouts
    └-- index.tsx
    └-- list.tsx
```

## Example using `childPages`

The `index.md` page is an "index page". That means it will have access to the `childPages` context property. In this case this will resolve to all of the other pages.

code:layouts/index.tsx

### Result

iframe:expected/index.html

## Example using `wantedPages`

The `list.tsx` layout is only used for the `list.md` page. This means that for this page we can specify the pages to list in the layout itself. In the index layout, we specify the glob `!(index).md`. This glob is relative to the `content` folder, and thus means "all markdown files in the content root, excluding the index.md file".

The pages that match this glob are returned to the layout (or any component, really) in the `context` argument. These pages receive the complete `Page` objects for the wanted pages. This means you can use properties like `title`, `summary` and `location.url`. The context is the second argument to the `Component` (the first being `Props`).

code:layouts/list.tsx

> Beware: The `wantedPages` array currently does not include the page itself. This is by design (as you can guess from the example), but might change in the future.

### Result

iframe:expected/list/index.html

## Content

code:content/index.md

code:content/list.md

code:content/page-1.md
