# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 2.3.0-beta

### Added

- Server functions

    It is now possible to create server functions to run on any path or path pattern. This means that you can update content, call external API's, re-build your site, or pretty much anything else. See the documentation for details.

## [2.2.0] (2022-01-13)

### Fixes

- Clean public dir on force instead of deleting

    Deleting the public dir recursively (previous approach) is not possible in Docker where the public dir is mounted. This changes the behavior to clean the directory instead, i.e. to delete each file/folder inside the public dir.

### Added

- Add `--public / -p` cli arg to specify public directory

    This makes it possible to build to any directory, useful for deploying to production.

- Add long-form aliases to all cli arguments (e.g. `-d / --drafts`)

## [2.1.1] (2022-01-12)

### Fixes

- Fix layout loader module loading error ([a5443b7])

## [2.1.0] (2021-12-22)

### Added

- Add `childPages` to context of index pages ([bee744e])
- Create edge components module and docs ([5fceb8c])
- Create page sorter based on weight ([bb4b298])

## [2.0.2] (2021-11-05)

### Fixes

- Check for full layout module path in import error ([2332da5])

## [2.0.1] (2021-11-04)

### Fixes

- Load layout modules via file url ([b800f0b])
- Reload layouts when running in server mode ([a328f43])
- Use real layouts dir for CSS paths ([8a5a6c0])

# [2.0.0] (2021-11-01)

### Changed

- The `Page` property `filepath` has been renamed `location`. To migrate, please change reference to this property to reflect the new name. E.g. `page.filepath.url` to `page.location.url`.
- The deprecated `ContentBase` and `ContentUnknown` types have been removed. Please use the new type `Page` instead.

### Added

- Create development server ([b0ef6c1]), closes [#6]
- Create static file copy to public dir ([5cc0f44]), closes [#5]

# [1.2.0] (2021-10-26)

### Fixes

- Filter current page from `wantedPages` array ([708f21a])

### Added

- Add `date` field to `ContentBase` ([b31eab6]), closes [#14]
- Add `summary` to page properties ([c2235fe]), closes [#9]
- Add output URL to FilePath ([03f319a]), closes [#8]
- Create helper for sorting pages by date ([1041ea0]), closes [#13]
- Do not build draft pages by default ([81f4c9d]), closes [#12]
- Set title on `ContentBase` ([1fea872])

## [1.1.1] (2021-10-08)

### Fixes

- Add affected content file to crash output ([e726840])
- Add help command to CLI ([23222a6])

# [1.1.0] (2021-10-08)

### Added

- Specify layout in content frontmatter ([0514da1])

# 1.0.0 (2021-10-07)

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
