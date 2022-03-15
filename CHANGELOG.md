# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Fixed

- Fix CLI crash when public dir not existing

### Changed

- Clear cache on force build

    When force-building, the new build should be as clean as possible. This includes clearing the cache before the build.

- DEPRECATED: `Location.url`

    The new way of getting the relative url directly from `Page.pathname` is much easier to work with. To migrate, change the places where you use the url to use `Page.pathname` instead.

- DEPRECATED: `Component.wantedPages`

    Now you can only define wanted pages on the component level, which is very limited. To migrate, change `wantedPages` to calls to `PageContext.getPages` instead.

## 2.4.2
*2022-03-15*

### Fixed

- Fix function `writeAndRender` not updating new dependants when creating new files

## 2.4.1
*2022-02-21*

### Fixed

- Fix missing functions argument when writing nginx config file from the CLI.

## 2.4.0
*2022-02-20*

### Added

- Ability to import / update content from the CLI

    Now you can specify a generator that yields content files in a `bob.ts` configuration file. This generator is run with the `--import` CLI flag. Partial updates based on the last import date are also possible. See the docs.

- Render TSX from functions

    Use the function context `renderResponse` to render a TSX component as the response. This method comes with type checking of the component and subsequent arguments. Just pass in a normal component and the props you want!

### Fixed

- Server no longer crashes when saving files in nvim

    A bug in the file modification watcher caused the change list to include temporary (non-existent) files when saving with certain editors, such as nvim, causing an error. This is now fixed.

- Server now re-builds correctly when layout files changed

    Because of the caching in Deno, the server was previously unable to re-build correctly when layout files were changed. Now changes in layout files will result in a complete site re-build with the new layouts.

### Changed

- Improve logging

    Writing individual files is now logged as DEBUG level. Add INFO logging for getting file system changes and dependant changes. Add logging for layout errors.

## 2.3.0
*2022-02-03*

### Fixed

- Content file deletions and creations are now correctly processed into changes

    This is done by comparing the content and public directories, and seeing if a file in one direcory has a corresponding file in the other.

- JSX now renders [empty HTML elements](https://developer.mozilla.org/en-US/docs/Glossary/Empty_element) without the end tag.

- JSX now renders numbers and booleans with the `toString()` method.

### Added

- Generate Nginx location config for functions

    The cli arguments `--fn-nginx-conf` and `--fn-hostname` now work together to create a configuration file for Nginx. This file includes locations of the functions (with path parameters transformed to regular expressions), and can be imported into a `server` section in an Nginx configuration file.

- Server functions

    It is now possible to create server functions to run on any path or path pattern. This means that you can update content, call external API's, re-build your site, or pretty much anything else. See the documentation for details.

## 2.2.0
*2022-01-13*

### Fixes

- Clean public dir on force instead of deleting

    Deleting the public dir recursively (previous approach) is not possible in Docker where the public dir is mounted. This changes the behavior to clean the directory instead, i.e. to delete each file/folder inside the public dir.

### Added

- Add `--public / -p` cli arg to specify public directory

    This makes it possible to build to any directory, useful for deploying to production.

- Add long-form aliases to all cli arguments (e.g. `-d / --drafts`)

## 2.1.1
*2022-01-12*

### Fixes

- Fix layout loader module loading error ([a5443b7])

## 2.1.0
*2021-12-22*

### Added

- Add `childPages` to context of index pages ([bee744e])
- Create edge components module and docs ([5fceb8c])
- Create page sorter based on weight ([bb4b298])

## 2.0.2
*2021-11-05*

### Fixes

- Check for full layout module path in import error ([2332da5])

## 2.0.1
*2021-11-04*

### Fixes

- Load layout modules via file url ([b800f0b])
- Reload layouts when running in server mode ([a328f43])
- Use real layouts dir for CSS paths ([8a5a6c0])

## 2.0.0
*2021-11-01*

### Changed

- The `Page` property `filepath` has been renamed `location`. To migrate, please change reference to this property to reflect the new name. E.g. `page.filepath.url` to `page.location.url`.
- The deprecated `ContentBase` and `ContentUnknown` types have been removed. Please use the new type `Page` instead.

### Added

- Create development server ([b0ef6c1]), closes [#6]
- Create static file copy to public dir ([5cc0f44]), closes [#5]

## 1.2.0
*2021-10-26*

### Fixes

- Filter current page from `wantedPages` array ([708f21a])

### Added

- Add `date` field to `ContentBase` ([b31eab6]), closes [#14]
- Add `summary` to page properties ([c2235fe]), closes [#9]
- Add output URL to FilePath ([03f319a]), closes [#8]
- Create helper for sorting pages by date ([1041ea0]), closes [#13]
- Do not build draft pages by default ([81f4c9d]), closes [#12]
- Set title on `ContentBase` ([1fea872])

## 1.1.1
*2021-10-08*

### Fixes

- Add affected content file to crash output ([e726840])
- Add help command to CLI ([23222a6])

## 1.1.0
*2021-10-08*

### Added

- Specify layout in content frontmatter ([0514da1])

## 1.0.0
*2021-10-07*

### Fixes

- Enable passing in undefined to content reader ([550eca4])
- Improve dirty layout checker logging ([3f396bf])
- Show force build warning only if actually forced ([ee4e0ca])
- Throw actual error when layout module importing fails ([d2c8225])
- Update tests to reflect new API ([5d313cb])

### Added

- Add ability to load pages ([2204a13])
- Add ability to read array of content files ([3ca93d4])
- Add ability to specify public output folder for build ([5837e80])
- Add build stats to cli output ([2f5ec2a])
- Add force building and verbose logging cli flags ([9a0a88a])
- Add proper layout lookup ([cffb530])
- Async component rendering ([a96516b])
- Create lookup for layout files similar to Hugo ([2de6819])
- Incremental builds ([16230bf])
- Rebuild everything if layout files changed ([2c01d4c])
- Render TSX based on a component file ([479da26])
