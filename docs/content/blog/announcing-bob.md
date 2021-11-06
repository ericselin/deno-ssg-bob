---
title: 🎉 Announcing bob - a static site generator for the dynamic web!
date: 2021-11-05
---

> ## The promise of `bob`
> - Sub-second content updates
> - Zero-latency content personalization
> - Great developer experience

The web should be static. Static sites have no server logic. They are fast and stateless and can be deployed virtually anywhere. Managing servers, databases and more, and scaling the aforementioned is a thing of the past with static sites. Granted, many impactful websites need some form of "dynamic" content, but can really benefit from having a predominantly static site with dynamic elements only where needed.

Because creating "dynamic" content can be solved with modern tools, static sites are now everywhere. All kinds of use-cases from e-commerce to marketing and blogging to documentation are exceedingly served by static sites. There are literally [hundreds of static site generators out there](https://jamstack.org/generators/). You might have heard about Next.js, Gatsby, or even Hugo?

## So why a new static site generator?

The short answer is: I haven't found the perfect static site generator. Some of them are too static and some are too dynamic. Too static because you need to solve the inevitable splashes of "dynamic" all by yourself. Too dynamic because they become magic black boxes of client-side functionality (everything from client-side routing to client-side rendering). The latter is an especially worrying development of the "static" movement, since content is not really static, it's just produced on the client instead of on the server (looking at you, JAMstack). But that's a discussion for another time.

## Problem nr. 1

The first problem with purely static sites is deployment speed. I.e. content updates are frequent, and thus we cannot trust that the static site is up to date. The argument is that a site cannot be static (i.e. pre-rendered) because builds and deployments cannot keep up with the rapid pace of content updates. If I had a nickle for every time someone said "we cannot make our ecom site static, because that would mean inventory levels aren't up to date!"...

This is something I can really understand, though. It is possible to minimize the time it takes for an update to go live, but at some point you start hitting the limit. Most (dare I say all?) static site hosting providers such as [Netlify](https://www.netlify.com/), [Cloudflare Pages](https://pages.cloudflare.com/) and [GitHub Pages](https://pages.github.com/) publish your site by building it on a disposable virtual machine (i.e. container). This container needs to be started, which on Cloudflare Pages takes about two and a half minutes. Yes, correct, in the order of minutes. This is time you cannot (easily) eliminate. There are other time-consuming steps as well, such as the actual site building, hashing the produced files to check for updates, but let's just leave it at over two minutes for now. So how do you publish your content updates faster?

## Problem nr. 2

The second problem is that static sites cannot be personalized to the user. I.e. the content is static and thus the same for everyone every time. Maybe you show a banner to everyone from the EU (hello GDPR!) or want to show personalized product recommendations. With a static site you need to solve this with client-side JavaScript. [Which is bad](https://ericselin.dev/blog/no-js-on-load/), and arguably not very static. Or you read my blog post and create a proxy-like solution, but that takes some learning and a lot of effort.

Solving this problem in a performant and robust way is super hard. In my experience, these needs are usually met by overloading the site with third-party client-side JavaScript or just running everything on a good ol' server. Almost nobody is even thinking about solving this in any other way. So how do you tailor content if you don't want a server and if you don't want to run code in the browser?

## A vision for a new type of static site

`bob` aims to solve both of these problems, and more. This is possible by building from the ground up with these issues in mind, and providing developers with the flexibility to create the actual layouts (i.e. design templates) as they wish. Flexibility and great developer experience for the layout parts enables a sharp focus on the infrastructure parts. Anyway, these are the pretty reasonable goals:

### Content updates in less than a second

After a content update (e.g. pushing an update to a content file to a git repository), the live website should show that content within a second. This is down from the two-three minutes or more that I'm accustomed to seeing. So it sounds a bit crazy. But here's how it will work:

1. Incremental builds

    When you update a page, only that specific page will be built. Along with any pages that depend on the page in question. I don't know of any static site generator that does this currently. While many of them are fast, building an entire site will never be as fast as building an individual page.

2. Incremental deploys

    The same applies to deploying content to production: only new content will be updated. Most CLI tools from hosting providers try to do this by hashing files and uploading only the changed files, but this is just a workaround. Because they do not know what has been changed, they will never be as fast as a system that does.

### Seamless zero-latency personalization

The produced static pages are, and always will be, fully functioning webpages on their own without any further processing (either on a server or in the browser). However, for truly dynamic parts, an extremely thin proxy layer is added before the content arrives at the user. It is here that parts of the page can be changed without the browser ever knowing about it (and without any need for processing the page in the browser).

To the developer, this will feel exactly the same as creating any other logic related to layout, content or design. `bob` will take care of generating the proxy for you. By the way, as an architectural decision, proxying like this has proven very efficient for me. I use it in production for some reasonably large e-commerce sites, and I think [everyone should use it way more](https://ericselin.dev/blog/no-js-on-load/).

## What is already there

All of this is still in development, but it's coming. The first step was to create a static site generator where all of this could eventually be implemented. Something that is a pleasure to work with and can run as fast as you do. Something like any other static site generator, but without the bells and whistles that only slow you down.

`bob` is already a fully functioning static site generator. It works on top of the magnificent [Deno](https://deno.land) runtime, and uses TSX components (JSX but in TypeScript) for creating layouts. You get type safety and a component-based approach right out of the box. And when the sub-second content updates and zero-latency personalization are released you are instantly upgraded. I already think `bob` is the best static site generator out there, but I'm a little bit biased, I suppose 😉.

> **[Follow the journey and star `bob` on GitHub!](https://github.com/ericselin/deno-ssg-bob)**
