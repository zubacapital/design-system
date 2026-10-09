# Zuba design tokens

Design tokens for the Zuba website, in the [Design Tokens Format Module 2025.10](https://www.designtokens.org/tr/2025.10/format/) (DTCG) format.

## Layout

* `zuba.resolver.json` — [resolver document](https://www.designtokens.org/tr/2025.10/resolver/) listing the token files and the order they are merged in. Point tools at this file.
* `primitive/` — raw values with no meaning attached: the palette, the spacing/radius/size scales, font stacks, durations, shadows.
* `semantic/` — roles: what a value is for (`color.text.subtle`, `space.gap.default`, `typography.heading.lg`). Every semantic token aliases a primitive, so a rebrand only touches this tier's aliases.

| Semantic group | Type | Covers |
| --- | --- | --- |
| `color.background`, `color.text`, `color.border` | color | Surfaces, copy, strokes |
| `color.action`, `color.feedback` | color | Controls and status messaging, as background/foreground pairs |
| `space.gap`, `space.inset`, `space.section`, `space.gutter` | dimension | Spacing between and inside elements |
| `radius.*`, `size.icon`, `size.control`, `size.measure` | dimension | Corner roles, icon/control sizes, content widths |
| `typography.*` | typography | Complete text styles |
| `border.*` | border | Complete stroke styles |
| `elevation.*`, `transition.*`, `layer.*` | shadow, transition, number | Depth, motion, stacking |

* `component/` — decisions scoped to one component, one file each (`button.primary.background`, `card.radius`). They alias semantic tokens and carry no `$type`: an alias takes the type of its target.

| Component | Styles it describes |
| --- | --- |
| `accordion` | FAQ list (`howitworks.css`) |
| `badge` | Investment focus/status labels |
| `button` | Hero and CTA actions, the shared `.btn` secondary button, form submits, text buttons |
| `callout` | Notices and contact prompts on legal pages |
| `card` | Benefits, insight posts, related links |
| `footer`, `header` | Site chrome, including navigation |
| `hero` | Home hero panel |
| `icon-tile` | Benefit icons, social links |
| `input`, `modal`, `notification` | Contact, sign-up and subscription dialogs |
| `prose` | Insight posts and legal pages |
| `section` | Page bands and the page title banner |

## Conventions

* Use the most specific tier available: component tokens alias semantic tokens, semantic tokens alias primitives. A component aliases a primitive only for a value that has no role outside it (`hero.panel.width`).
* Values CSS can express but the format cannot are recorded under `$extensions["com.zubacapital.css"]`, with the closest static value in `$value` (see `space.gutter.page`).
* Colors are objects (`colorSpace`, `components`, optional `alpha`) with a 6-digit `hex` fallback. `components` is the source of truth.
* Dimensions are `{ value, unit }` with `px` or `rem`. The format has no `%`, `vw` or `calc()`; values that need them stay in CSS.
* Palette steps (`navy.900`) follow a 50–900 lightness scale. Only steps in use are defined — add a step rather than reusing a near match.
* Group-level `$type` is inherited, so tokens usually only carry a `$value`.
* Files are formatted by Biome (`just lint-fix`).

## Primitive ↔ CSS

The primitives were extracted from `src/public/css`. The custom properties in `style.css` map to them as follows:

| CSS custom property | Token |
| --- | --- |
| `--color-primary`, `--color-bg` | `color.navy.900` |
| `--color-bg-light` | `color.navy.50` |
| `--color-secondary` | `color.navy.200` |
| `--color-text` | `color.slate.600` |
| `--color-border` | `color.slate.200` |
| `--color-red`, `--color-red-bg` | `color.red.500`, `color.red.100` |
| `--color-success`, `--color-success-bg` | `color.green.500`, `color.green.100` |
| `--color-white`, `--color-black` | `color.white`, `color.black` |
| `--space-*` | `space.*` |
| `--radius-*` | `radius.*` |
| `--shadow-*` | `shadow.*` |
| `--text-*` | `font.size.*` |

## Status

Canonical. `www`'s stylesheets are generated from these tokens (via
`@zuba/design-system`'s `dist/css/tokens.css`). `audit.md` is the historical
record of every value disagreement the CSS had with itself before that
migration, and how each one was resolved — see its "Recommendations" section.
A few of those resolutions are worth knowing before changing a token:

* Cards use `radius.card` (12px) uniformly now; `article`/`.card` were 16px.
* Card padding is `space.inset.lg` uniformly now; `.benefit` was `space.inset.xl`.
* Footer text is `typography.body.sm` (0.875rem) uniformly now; the CSS had a
  responsive 0.9rem/1rem step that's gone.
* Circles use `radius.circle` (999px) in place of `50%`.
* Fluid values (`calc(1rem + 1vw)` and similar) are only tokenized for
  `space.gutter.page`; others stay as raw CSS.
* `shadow`/`elevation` and a few unreferenced primitives (`font.size.lg`,
  `font.size.5xl`, `z-index.base`) were deleted outright — nothing used them.
* `input.background`/`input.foreground` were dropped (no input sets either).
  `prose.h3.color` was kept and is now actually applied in `post.css`.
