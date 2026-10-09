# @zuba/design-system

Shared design tokens for zuba apps (`www`, the app), authored against the
[W3C Design Tokens Community Group 2025.10 stable spec](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/)
and built with [Style Dictionary](https://styledictionary.com/).

## Layout

```
src/tokens/
  primitives/   raw values (color swatches, spacing scale, radii, shadows, typography, breakpoints)
  semantic/     aliases of primitives, carrying the exact output CSS custom-property name
                via $extensions.zuba.cssName
style-dictionary.config.mjs   custom transforms for DTCG's structured color/dimension $value objects
dist/css/tokens.css            built output, committed (see "Consumption" below)
```

Colors are authored as the spec's structured object shape
(`{colorSpace, components, alpha?, hex?}`), not plain CSS strings. Dimensions
are `{value, unit}`. `$type: "fluidDimension"` is a deliberate, documented
non-standard extension for `calc()`-based fluid values, since DTCG's
`dimension` type is a single value+unit term.

## Building

```
pnpm install
pnpm build   # style-dictionary build -> dist/css/tokens.css
```

`dist/` is committed, not gitignored. This repo is consumed as a **git
dependency** (no private npm registry yet), so there is no publish step to
produce build output — anyone installing a given commit/tag needs the built
CSS to already be in the tree. Whenever you change a token, run `pnpm build`
and commit the resulting `dist/css/tokens.css` diff alongside it.

## Consumption

Add as a git dependency pinned to an exact commit SHA (not a branch or a
mutable tag), e.g. in a consumer's `package.json`:

```json
"@zuba/design-system": "github:zubacapital/design-system#<commit-sha>"
```

Then reference `node_modules/@zuba/design-system/dist/css/tokens.css` — in
`www` this is copied into `src/public/css/tokens.css` by the `tokens:sync`
script before dev/build/test.

## Extending per app

Each consuming app may layer its own semantic tokens on top of this
package's primitives rather than forking it: point a local Style Dictionary
config's `source` at `node_modules/@zuba/design-system/src/tokens/**/*.json`
plus the app's own extra token files. Keep this repo limited to values both
apps actually share — if a value only applies to one app, it belongs in that
app's own layer, not here.
