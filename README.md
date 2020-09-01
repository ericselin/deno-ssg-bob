# Bob the static site builder

Bob is a static site generator built on top of the [Deno](https://deno.land) runtime.

**Goals**:

- Type safety and intellisense in template files by using TypeScript template literals in layout files
- JS bundling via native Deno bundle command
- Unused CSS removal via postcss
- Efficient image manipulation via the Sharp library
- Speed via Worker-based multithreading
- Easy for web developers to reason about because it's built in TypeScript
- Incremental builds
- Multilingual
- Pluggable (behind the scenes at least) in order to make development easier

Functional programming and Domain Driven Design is used as much as possible in the core.