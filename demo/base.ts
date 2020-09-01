import { ContentRenderer } from "../mod.ts";
import { Content } from "./site.ts";
import index from "./index.ts";

const layout = (content: Content) => {
  switch (content.type) {
    case "index":
      return index(content);
    default:
      return `<main>${content.content}</main>`;
  }
};

const base: ContentRenderer<Content> = (content) =>
`<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="ie=edge" />
  <title>Bob the static site builder</title>
  <link href="https://fonts.googleapis.com/css?family=Fira+Code:300,700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/style.css" />
</head>

<body>
  <header>
    <a href="/">//bob</a>
    <ul>
      <li><a href="/features/">Features</a></li>
    </ul>
  </header>
  ${layout(content)}
  <footer>
    Bob is built with Deno
  </footer>
</body>

</html>
`;
export default base;
