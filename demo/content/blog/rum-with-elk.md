---
date: 2020-06-05
title: Web vitals real user monitoring with Elasticsearch and Kibana
---

Elasticsearch is awesome. I had it on my "things to learn" list for quite a while, and I finally got to it when an ecommerce site I'm working on needed some real user monitoring (RUM) to make sure performance stays superb. This is the story of how easy this was to set up with Elasticsearch and Kibana (ELK - or at least EK).

Web vitals is a term for some new metrics surrounding site usability. There are three "core" web vitals metrics: Largest Contentful Paint, First Input Delay and Cumulative Layout Shift. These represent the percieved loading time, interactivity and layout stability. All super critical, and all super annoying if you get them wrong. I won't write more than that about these, so if you're not familiar with them, you'll benefit from [reading up a little bit](https://web.dev/web-vitals).

If you're not optimizing your site for performance, you need to do that now. And I really mean now in a literal sense. Performance impacts organic search, paid ads, and all kinds of business metrics. And most importantly, it impacts your users. Please respect your users. The importance of performance is the topic of another blog post, but I really needed to get that said.

These are the steps I took in order to get an awesome dashboard of the core web vitals in the field, complete with histograms and percentile gauges of Google's recommended performance values:

1. Sign up at a cloud ELK provider
2. Create your deployment and an API key
3. Create a [Cloudflare Worker](https://workers.dev) for sending data into Elasticsearch
4. Write a few lines of client-side JavaScript
5. Create your dashboard in Kibana
