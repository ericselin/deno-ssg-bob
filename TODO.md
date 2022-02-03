# Todo

## 1.3 Incremental builds and functions

- x on deleted content file
    - x re-render dependants
    - x delete output file
    - x delete dependant cache entries
- x on orphaned public file
    - x delete public file
    - x delete dependant cache entries
- x glob matching for reacting to additions (dependants should be re-rendered)
  - x should not run when force building
- x gh: closed #4 (needspages dirtier)

## 1.4 Stabilization, simplification (+deprecation notices)

- make getpages always save deps (no proxy)
- move to content generator pattern
- deprecate wantedpages
- possibly deprecate children
- delete cache on force build
- refactor api.ts code, e.g. rename processor -> renderer, work off of input paths, not location
- create `--validate` cli flag to build a clean site (force build) and compare to incremental build
- gh: possibly closed #1 (if layouts changed and there's a build error, the following incremental build is not up to date)
- gh: reload layouts when in server mode
- build viewed pages first and browser autorefresh immediately after render
- gh: localhost port to url when in server mode OR rethink URL altogether
- update content file only if content newer than cache (or based on actual comparison of object)
- gh: building symlinks
- gh: chore: io/exists depencency removal
- gh: chore: update dependencies
- gh: tests: add ci tests for mac/win

## 1.5 Speed and performance (build and update)

- run render in parallel, but don't necessarily write in parallel, consider workers
- implement performance monitoring / profiling
- identify bottlenecks
- make it fast

## 1.6 Theme helpers

- gh: create word count for posts
- gh: allow component to return string or undefined
- gh: get page title from markdown if not set in frontmatter
- jsx fragments
- functions context getpages addition
- functions context generic type for write and update functions (e.g. `update<Order> = update(Partial<Order>)`

## 2.0 Production ready: documentation and cloud hosting

- cloud: document functions update code procedure
- bob-admin scripts and/or service for management
- move bob docs to bobsite
  - add keycdn with cache invalidation
  - add github push webhook listener for updating content
- gh: add storybook integration docs
- gh: add code highlighting for code blocks
- gh: ability to build based on online theme
- gh: add changelog and current version to docs site
- move repos to bob org
