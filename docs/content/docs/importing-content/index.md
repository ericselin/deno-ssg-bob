---
title: Importing Content
---

Some of the content you want to display on your site might live in other places than git-backed Markdown files. And that's completely fine. No need to turn away from static sites just because you want to have pages for your Shopify products or Hubspot tickets!

In `bob`, external content is imported using async generators (i.e. `AsyncGenerator`). Generators are extremely useful constructs, and async generators are perfect for fetching data from paginated API endpoints. All you need to do is define your generator function that yields objects of the `Content` type, which includes the content path (within the content directory) and an object describing the content itself. Then just configure the content importer in the `bob.ts` config file, and `bob` will take care of the rest.

> Content pages returned (yielded) from content generators are rendered into the `content` directory in order to easily see exactly how the resulting site structure will be. This means that you probably want to add such pages to your `.gitignore` file.

## Examlpe

code:bob.ts

Here we have a simpler than simple content generator that yields one page with only a title. (The idea is only to show how to configure `bob` and not how generators work, however.) This yielded page will be rendered into the content directory and can be used normally within `bob`.

## Passing in parameters to your generator

You probably need to set up your generator in some way, i.e. with API keys or similar. You can just pass in these options to the generator. This is the way generators work.

## Partial imports

If your content importer supports partial imports, you can get the last update date by yielding undefined as the first yield in the generator and saving the result in a variable. If no previuos import exists or a force build was requested, the return value will be `undefined`.

```ts
async function* getContent(): ContentImporter {
  const date: Date | undefined = yield;
  // date now holds the last import date
  console.log("date", date);
  // use it in your query to provide partial updates
  const updates: ImportedContent[] = await getUpdatesSince(date);
  for (const content of updates) {
    // yield content normally
    yield content;
  }
}
```

## Deleted content

If your importer knows when content has been deleted, you can yield a `DeletedContent` object to delete that particular content page. This object should have a `contentPath` property, as well as a `deleted = true` property (instead of the normal `data` property).

```ts
async function* getContent(): ContentImporter {
  yield { contentPath: "/new-page.md", data: { title: "Page" } };
  yield { contentPath: "/old-page.md", deleted: true };
}
```
