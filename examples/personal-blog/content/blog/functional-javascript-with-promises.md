---
date: 2021-01-22
title: Functional JavaScript with promises
---

Functional programming is awesome. It makes code easy to reason about and easy to test. It promotes the use of good code structuring. Unfortunately for web developers, JavaScript is not functional. The [pipeline operator proposal](https://github.com/tc39/proposal-pipeline-operator) would bring a little bit of functionality, but it is far from here.

## Enter Promises

There is one very well supported language feature that can behave like a pipeline: Promises. Just pass in a value and chain some functions. Sounds like functional programming to me! Let's see an example:

```js
// functions
const addOne = (num) => num + 1;
const multiply = (factor) => (num) => num * factor;

// pipeline
const result = await Promise.resolve(1)
  .then(addOne)
  .then(multiply(2));

console.log(result);
// 4
```

Looks pretty good and works good as well! And as a bonus you get automatically resolving promises.