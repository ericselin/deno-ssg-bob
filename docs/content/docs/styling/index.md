---
title: Styling and CSS
---

Style your component with a good ol' CSS file and mark it as a dependency to your component. Then, render the needed (and only the needed) CSS directly into the HTML `<head>`.

## 1. Add CSS to your component

Add the layout-directory-relative path to the CSS file in the `needsCss` property of your `Component`. As a best practice, keep the CSS in a file with the same name as your component, just with the `.css` extension. So if you have a component in `layouts/blog/index.tsx`, create the styles in `layouts/blog/index.css`, and add it to your component with `Index.needsCss = "blog/index.css"`. This makes it extremely clear what CSS files are included with a component (no "magic"!).

code:layouts/index.tsx

code:layouts/index.css

## 2. Render CSS to HTML

The `context: Context` provided to all components will receive an array of needed CSS filenames in the `context.needsCss` property. Do whatever you like with this list (just remember that files from the `layout` directory *are not* copied to the output directory!). As a best practice, render the needed CSS into a `<style>` tag using the `readContents(filepaths: string[])` helper.

code:layouts/_base.tsx

code:layouts/_base.css

## Result

The layouts above will produce the following site (see below for content).

iframe:expected/index.html

### Content

code:content/index.md
