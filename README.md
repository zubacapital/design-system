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
produce build output — anyone installing a given tag needs the built CSS to
already be in the tree. Whenever you change a token, run `pnpm build` and
commit the resulting `dist/css/tokens.css` diff alongside it.

## Versioning and releasing

This package is versioned with semver (`package.json`'s `version`) and
released as a git tag, the same convention `www` already uses for its own
releases (bare version, no `v` prefix — see `www`'s `justfile release`
recipe): bump `version`, commit, then `git tag <version>` and push the
commit and the tag.

**Every consumer pins to a released tag, not a branch or a raw commit SHA.**
A tagged release is this repo's equivalent of a published npm version, so a
specific `www` release should always record which design-system tag it was
built against — when you cut a `www` release, check whether a newer
design-system tag should be picked up first, and bump the dependency as its
own deliberate step rather than letting it drift silently.

## Consumption

Add as a git dependency pinned to a released tag, e.g. in a consumer's
`package.json`:

```json
"@zuba/design-system": "git+ssh://git@github.com/zubacapital/design-system.git#1.0.0"
```

(`github:org/repo#tag` resolves over HTTPS and needs interactive
credentials in some environments; the explicit `git+ssh://` form uses the
SSH key already set up for push access instead.)

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
