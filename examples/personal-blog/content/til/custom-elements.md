---
date: 1.6.2021
title: Gotchas when using custom elements in production
tags:
  - custom-elements
---

HTML and CSS needs to be included somehow. The best case is to have the html "template" ready the way it should look, and then just define the custom element, but for encapsulation and usage in other frameworks, you might consider:

- External file(s): loading the HTML via a loader (webpack / parcel / etc)
- Inside JS: use template strings in the js file, possibly with an IDE plugin for language services

Remember, global css doesn't work inside a shadow root. There are no perfect solutions for this:

- `<link>` elements download the stylesheet many times if inserted dynamically
- SASS includes require additional building

One option is not to use a shadow root in cases with heavy global styling.

