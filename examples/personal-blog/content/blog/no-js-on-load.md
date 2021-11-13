---
title: 'New rule: no JavaScript on page load'
date: 2021-09-06
---

Client-side JavaScript (computing things in the web browser) is getting pretty darn awesome for creating apps out of web pages. You can do almost anything in the browser nowadays, such as video conferencing, 3D modeling, local file editing, even hardware I/O interaction, and much more. But since [your website is not an app](/blog/your-website-is-not-an-app/), you really do not need or want to execute tons of JavaScript when your page loads. Why? Because the page is just **content**, at least when it initially loads.

## Executing JavaScript on page load is bad

### Performance

This is my biggest passion, and it should be obvious. The more work you do (i.e. compute / execute / process), the longer it's going to take. And the higher the chances that you make a mistake. Just do less, and that will equal less time, less battery usage. It all boils down to being respectful of your users and providing a great experience. But less time (better performance) also means more money for you.

### Search engine ranking (or, SEO)

It should come as no surprise that client-side JavaScript is bad for SEO. Although not neccessarily 100% accurate anymore, search engines cannot see your fancy client-side rendered content. Which is bad. Meanwhile, they are increasingly focusing on performance as a ranking attribute. Which also boils down being respectful of users and providing a great experience.

### Accessibility

Is your site usable on a low-end phone with an expensive but sub-par mobile connection? Probably not. And you might be fine with that. But even rich white men in their Teslas are sometimes driving through tunnels. And sometimes the Internet just doesn't work perfectly (it's quite a complicated piece of engineering, after all), so your page might not render for tens of seconds because that one third-party A/B testing tool just doesn't load immediately.

### Honorary mention: developer experience

Ask your frontend developer if they would like a world where they could just code for the newest devices while older devices would "just work" with static content. Serving pages that work without JavaScript and enriching those pages if the browser supports some new API that you want for your interactive shopping cart (what we in the biz call "progressive enhancement"). Note that this new API should of course *not* be used on page load anyway.

## We can eliminate JavaScript execution from page load

Think about it. Wouldn't it be great? The original promise of the World Wide Web with focus on content, accessible to all including usability on any device or network. Try turning off JavaScript in your browser for a moment and enjoy the speed of the Internet! You might say that I'm crazy, that you need all of your JS stuff, and tomorrow you'll need even more. That you can only solve your problems by including some more `<script>` tags on your page. Now consider the alternative. What if I'm right? What if we could eliminate all JavaScript from page load? [Isn't that worth fighting for?](https://www.quotes.net/mquote/121319)

I know that you think I'm crazy, that you could not possibly get rid of your precious `<script>` tags. At least since you followed my advice and created your site as static HTML, CSS, and of course JavaScript ("JAMstack"). And that's ok. But let's dig a little deeper into that with some examples of what you might need. I'll try to create as many examples as possible for how to solve different problems without resorting to client-side JavaScript.

## Examples

These are or will be links to related blog posts. Stay tuned...

- Changing page contents based on the user or request
  - A/B testing
  - GDPR banner
- Tracking users
  - Analytics
- Creating interacivity or elaborate designs
  - Carousels
  - Masonry layout
  - Instagram image gallery
  - Menus, tabs, and the like
  - Image zoom
- Editing "dynamic" content
  - Rapidly changing content e.g. managed by marketers
  - Tag managers
- Best practices
  - Lazy loading images
