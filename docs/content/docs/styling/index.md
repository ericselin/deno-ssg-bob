---
title: Styling and CSS
---

Style your component with a good ol' CSS file and mark it as a dependency to your component. Then, render the needed (and only the needed) CSS directly into the HTML `<head>`.

1. Add the layout-directory-relative path to the CSS file in the `needsCss` property of your `Component`.
2. In your base layout (or wherever you render into the `<head>`, use the `Contenxt.neededCss` property to get a list of needed CSS filenames.
3. Render the content of the CSS files into the head using the `readContents()` helper.
