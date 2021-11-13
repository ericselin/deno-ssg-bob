---
date: 2021-05-17T00:00:00+02:00
title: 'Servers are cool again - they''re just a bit different now'
modified: 2021-05-17T20:07:45+02:00
---

I don't like executing code on the client, i.e. in the user's browser. I think it's disrespectful, wasteful, and worst of all (for your business), results in lowered performance. [I recently wrote about it on this very blog.](/blog/your-website-is-not-an-app/) But as many have pointed out, sometimes you need dynamic functionality on your site. Or maybe you need some logging / analytics. In any case, I absolutely agree that there are some very good reasons to change or react to every individual request (i.e. "page load" in a sense). This of course is not possible with a purely static site with no client-side JavaScript. So what do you do then? You execute your code on a server instead.

And then you say: "But Eric, you must hate servers as well - they are for sure not very static!" To which I say: "Yes, you are right, I hate servers as well." Hate is a pretty strong word here, of course. Servers are essential for everything we do, but in the context of websites, I kind of hate them. (Note that all pages are sent by servers, this page included. But this page was sent from the dumbest and simplest server possible - one that only sends raw text files over the network.) Anyway, bear with me, it's going to get clearer.

## Why (traditional) servers are bad

Servers are bad for one big reason: they scale extremely poorly. If you have one server in one location, you're in big trouble. Network traffic from your customers in Japan need to travel around the world to your server in Sweden. And when your site gets more popular, everyone will get worse performance because one server can only handle so much traffic. You can of course do vertical scaling (buy more computing power from your server provider) or horizontal scaling (buy more servers, possibly geographically distributed around the world). But scaling is *hard* - proper hard. Not least because orchestrating these different forms of scaling (when to scale where and how) is difficult and *always creates overhead*.

Servers are also bad for one smaller reason: they create a single point of failure. If you scaled horizontally, there are of course many points of failure. Either way, you should always try to minimize the amount of work you do, i.e. the amount of logic and code you execute. And more orchestration means more logic. And creating pages on the fly with whatever server framework you happen to like means more logic. I guess what I'm trying to say is that servers inherently create more logic (complexity), which in itself is bad, mostly because the "surface area" for bugs and other problems is bigger. Not to mention the development effort of all of this.

## What you should do instead

Right, everyone knows servers are bad. And besides, nobody has a machine in the closet running a server anymore. We now have containers (Docker), function-as-a-service (Lambda et. al.) and everything in between. But oftentimes these still - while much better - suffer from a lot of the same problems as traditional servers. You can try to prove me wrong, but remember, the longer your explanation of why your "servers" scale perfectly and the more components your solution includes, the more you contradict yourself.

Anyway! To my actual point: what you should do is run your very simple and fault-tolerant code "on the edge". That means running it in every location your Content Delivery Network (CDN) has, which should be in the hundreds. And all of the orchestration should be done by your CDN - your very simple program should "just work" everywhere transparently. And it should scale basically indefinitely, without overhead. Luckily, this solution already exists. You can just upload a single JavaScript file to your CDN and have it execute on every request everywhere. It's based on the V8 JavaScript engine, which means that for every request you get a new process practically instantly (looking at you, Lambda, with your insane cold starts). And the only thing you need to worry about is your little script.

These solutions are freaking awesome. You can do basically anything with them if you use your imagination. Some providers offer very simple and performant key-value stores for eventually consistent data (like the contents of a page) and even database-like always consistent records that live on the network edge (on the CDN). Cloudflare has "Workers", Akamai has "Edge Compute", and even Netlify has "Edge Handlers" (although Netlify's is still in public beta). To me, combining static files with these kinds of edge functions sounds like the holy grail of web computing. I couldn't be more surprised that this amazing way of working is not talked about every damned day.

## Practical example

In my view, the best way to utilize functions on the edge is to rewrite an existing static (HTML) page. That way, the function acts as a kind of "progressive enhancement" to the already functioning page. More simplicity, less things to break. One such use-case A/B testing, where current commercial solutions (i.e. SaaS products you can buy) are particularly bad from a performance perspective. (Here, I'm referring to UI / UX / content tests that you run on the site.)

The way most sites carry out A/B tests is to install a simple JavaScript snippet (tag) from their favorite A/B platform, design tests in their WYSIWYG editor, and press play. This is very simple for all parties involved, particularly the marketers that design the tests. But this comes with an enormous performance penalty. All the test logic is executed by the end user browser - almost always a mobile phone. In practice, what happens on the user's mobile phone is something like the following:

1. Start loading and rendering the page normally
1. Pause rendering of the page when encountering the (synchronous) A/B testing script tag
1. Load the script over the network from a server somewhere
1. Parse script, i.e. create machine-readable instructions from the loaded script file, and start executing instructions
1. Script hides all page content temporarily, since it will be changed anyway
1. Script decides what tests to run on the page
1. Script determines which group the current user belongs to in each test
1. Script changes the page contents based on the tests and user groups
1. Script shows the page again, since it's now ready
1. Page loading and rendering is done
1. Script reports back to the A/B testing platform that this test was executed

This of course happens reasonably fast on modern hardware and with a good network connection. But it seems completely unneccesary! Page rendering (i.e. showing the page to the user) is blocked until everything is ready. One or more network requests need to be made, including DNS lookups, SSL handshakes, and all that. And all of the work is executed by the user's device.

Utilizing functions at the edge, the work done by the user's mobile phone is the following:

1. Load and render the page normally

This seems crazy, right? But it is true. All of the work is done by the rewriting edge function instead of the mobile phone. No additional network requests, no JavaScript parsing and execution. And remember, this is all done at the CDN level, so with virtually no performance penalty. I have a proof-of-concept of this going at this very site.

Try out e.g. [Cloudflare Workers](https://workers.cloudflare.com/) today, you'll never go back!
