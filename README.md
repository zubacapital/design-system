# @zuba/design-system

Shared design tokens for zuba apps (`www`, the app), authored against the
[W3C Design Tokens Community Group 2025.10 stable spec](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/)
and built with [Style Dictionary](https://styledictionary.com/).

## Layout

```
tokens/
  zuba.resolver.json   resolver document: which files, which tier (primitive/semantic/component),
                       merge order - style-dictionary.config.mjs reads this to build its source list
  primitive/   raw values with no meaning attached
  semantic/    roles that alias primitives (color.text.subtle, space.gap.default, ...)
  component/   decisions scoped to one component, aliasing semantic tokens
  README.md    token-authoring conventions
  audit.md     historical record of every CSS/token value disagreement and how it was resolved
style-dictionary.config.mjs   custom transforms for DTCG's structured color/dimension $value objects
dist/css/tokens.css            built output, committed (see "Consumption" below)
```

See `tokens/README.md` for the full authoring conventions (colors are
structured objects with `components` as the source of truth, dimensions are
`{value, unit}`, the `$extensions["com.zubacapital.css"]` escape for values
the format can't express natively, and the tier/aliasing rules).

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

Each consuming app may layer its own semantic/component tokens on top of this
package's tiers rather than forking it: point a local Style Dictionary
config's `source` at `node_modules/@zuba/design-system/tokens/**/*.tokens.json`
plus the app's own extra token files. Keep this repo limited to values both
apps actually share — if a value only applies to one app, it belongs in that
app's own layer, not here.
