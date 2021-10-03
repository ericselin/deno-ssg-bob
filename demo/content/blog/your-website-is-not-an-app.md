---
date: 2020-12-04
title: Your website is not an app 🙄
---

We made everything too complicated. We do this, us developers. It's fun to invent a new and better way to do things. And to use all the "new things". But I think this is the time to stop and think about what we are doing. One of those things is treating every website like an app - although most sites are nothing of the sort.

## The web was designed for documents

The World Wide Web (www) was designed to be a collection of documents that could be linked together. And ever since its inception, the www worked this way. Even the most cutting edge modern browsers are optimized for this.

At first (think the 90's), we hacked a lot of things on top of these documents with client-side code because that made them better. But browser are pretty good these days, and now we do it just because we can - and because it's cool. But problems started popping up. We solved them in very intricate ways (looking at you, Webpack). We came up with new ways of developing (looking at you, React and friends). This made everything a lot more complicated and moved us away from thinking about documents.

We forgot why we started down this path: to make it better for our users. We're releasing more and more things on top of other things, and for what? Who decided users want these things? Not the users, that's for sure! But most of all, we forgot the core of the www: documents.

So why do we use very complicated and fragile tools and methods in order to show documents to users - something browser vendors have been perfecting for decades?

## Most websites are documents

Sure, we have better and better possibilities to do almost anything with JavaScript and WebAssembly, but at its core, the www is for documents. And while some websites really are more "apps" than "documents", and thus benefit from this evolution, most websites are not "apps". Is a blog an app? Most certainly no. Is an ecom store and app? Also no. I absolutely love the possibilities the web platform gives us to build apps, I'm just saying that your site is probably not an app.

Most of the internet is static and not dynamic. Dynamic means that it's different every time or most of the time ([continuous change](https://www.merriam-webster.com/dictionary/dynamic)). But changing the content (and thus the HTML document) every now and again is not continuous. This includes an ecom store updating the number of available products based on current inventory values (unless you sell one of each product every few seconds). Just render an updated document from the content that has changed, upload to a Content Delivery Network (CDN), and be done with it.

Sometimes you have content that is dynamic because it's different for each user. Most of the time, this is not the entire site, though. You might show a flag based on the user's location, for instance. The whole site doesn't need to be dynamically rendered because of this. Just solve that one problem with as little (total) code as you can.

So why do we treat our sites in this way - rendering each page every time either on the server or on the client? 

## Documents should be static

As most of the internet is static, it means we can - and should! - do as much work as possible as early as possible. One page (for a document) is just a bunch of HTML, so you can render it all the way to HTML. Do you need to fetch your reviews, product recommendations, and even page contents itself from a database on every hit? Clearly not. Sure, you have caching but the database is still the end of the line. When the end of the line should just be the HTML document.

If you buy into the JAMstack you would say that your HTML is static, it's just enhanced ("hydrated") with some nice client-side features. Server-Side Rendering (SSR) is what it's sometimes called. But React on a static site, that's just not needed. Is your client-side routing better than Chrome's document navigation? I'm betting that it's not.

When you are writing an app out of a document, how are you making the internet better for users? Is React or Vue or Gatsby or Next better? Or is plain and simple HTML the best? There is only one judge: your users. And they don't care about your tech stack. Just show them the content they want to see.
