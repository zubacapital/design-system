# Design token audit

Which tokens in `assets/tokens` are actually used by the site's code. The review is in three stages: primitive, semantic, then component tokens.

## How usage was measured

**Nothing references the tokens yet.** No stylesheet, template or build step reads the `.tokens.json` files; the CSS in `src/public/css` was written by hand before the tokens existed. By name, all 307 tokens are unused.

So this audit asks a more useful question: **would each token be used if the CSS were generated from the tokens today?** A token counts as used when its value appears in the CSS in the role the token describes:

- **Primitive:** the value appears in a declaration of the matching kind (a color in a color property, a spacing value in padding/margin/gap, and so on). It counts whether written literally or through the `:root` custom property that holds it (`var(--space-md)` counts as `space.md`).
- **Semantic:** as above, but only in properties that fit the role (`color.text.*` only in `color`, `color.background.*` only in `background`). Every match was then reviewed by hand against its selector.
- **Component:** checked against the declarations of the selectors the component describes. It's either used, set to a different value (drift), or not set at all.

Scope: the 13 site stylesheets in `src/public/css`. The vendored `klaro*.css` is excluded. Templates and `main.js` hold no design values; emails (`src/mjml`) and SVG icons are out of scope. All CSS locations below are relative to `src/public/css/`.

## Summary

| Stage | Tokens | Used | Partly / approx. | Unused |
| --- | ---: | ---: | ---: | ---: |
| 1. Primitive | 79 | 66 | 1 | **12** |
| 2. Semantic | 79 | 74 | 1 (implicit) | **4** |
| 3. Component | 149 | 133 | 12 (drift) | **4** |

The largest dead area is **shadows**: 9 tokens across two tiers (`color.black-alpha.{5,8,12}` → `shadow.*` → `elevation.*`). The site has no `box-shadow` anywhere.

## Stage 1 — Primitive tokens

12 of 79 primitives appear nowhere in the CSS.

### Unused

| Token | Value | Aliased by | Notes |
| --- | --- | --- | --- |
| `color.black` | `#000000` | `color.text.default` | Only as the fallback in `var(--color-text, #000)` (`header.css:4`). `--color-black` is declared but never read. |
| `color.black-alpha.5` | `rgba(0, 0, 0, 0.05)` | `shadow.sm` | Only feeds `shadow.sm`. No shadows in the CSS. |
| `color.black-alpha.8` | `rgba(0, 0, 0, 0.08)` | `shadow.md` | Only feeds `shadow.md`. No shadows in the CSS. |
| `color.black-alpha.12` | `rgba(0, 0, 0, 0.12)` | `shadow.lg` | Only feeds `shadow.lg`. No shadows in the CSS. |
| `font.size.sm` | `0.875rem` | `typography.body.sm` | Feeds `typography.body.sm`. The footer uses `0.9rem` instead (`footer.css:7`). `--text-sm` is declared but never read. |
| `font.size.lg` | `1.125rem` | — | Not referenced by any token either. `--text-lg` is declared but never read. |
| `font.size.5xl` | `3rem` | — | Not referenced by any token either. `--text-5xl` is declared but never read. |
| `duration.none` | `0ms` | `transition.default` | Only the `delay` of `transition.default`; CSS leaves the delay implicit. Keep it: the format requires a delay. |
| `shadow.sm` | `0px 1px 2px 0px rgba(0, 0, 0, 0.05)` | `elevation.low` | `--shadow-sm` is declared but never read; no `box-shadow` anywhere. |
| `shadow.md` | `0px 4px 6px 0px rgba(0, 0, 0, 0.08)` | `elevation.medium` | `--shadow-md` is declared but never read; no `box-shadow` anywhere. |
| `shadow.lg` | `0px 10px 20px 0px rgba(0, 0, 0, 0.12)` | `elevation.high` | `--shadow-lg` is declared but never read; no `box-shadow` anywhere. |
| `z-index.base` | `0` | — | Not referenced by any token either. |

### Used, but outside the token graph

These values are in the CSS, but no semantic or component token aliases them. The semantic tier has no role for them yet.

| Token | Value | Where | Notes |
| --- | --- | --- | --- |
| `space.none` | `0rem` | `footer.css:60`, `header.css:12`, `header.css:79` +14 | Zero values (`padding: 0`, `top: 0`); no token aliases it. |
| `space.2xl` | `3rem` | `home.css:32`, `post.css:4`, `subscription.css:24` +1 | Used 4× in CSS, but no semantic token aliases it. |
| `radius.none` | `0px` | `footer.css:95`, `header.css:63`, `insights.css:28` | Zero values; no token aliases it. |
| `radius.sm` | `4px` | `home.css:249` | Only via `border-radius: var(--space-2xs)` on `.investment` (a spacing variable used as a radius). `--radius-sm` is declared but never read. |
| `breakpoint.lg` | `1200px` | `home.css:305` | Used in `home.css:305`, but no semantic or component token aliases it. |

<details>
<summary>All 79 primitive tokens</summary>

| Token | Value | Status | Uses | Where | Aliased by |
| --- | --- | --- | ---: | --- | ---: |
| `color.white` | `#ffffff` | ✅ used | 18 | `contact-form.css:20`, `footer.css:3`, `header.css:3` +15 | 5 |
| `color.black` | `#000000` | ❌ unused | 0 | — | 1 |
| `color.navy.50` | `#f2f9fc` | ✅ used | 7 | `contact-form.css:28`, `home.css:112`, `legal.css:7` +4 | 1 |
| `color.navy.200` | `#c6d4db` | ✅ used | 2 | `footer.css:86`, `howitworks.css:89` | 1 |
| `color.navy.900` | `#102b38` | ✅ used | 26 | `contact-form.css:17`, `contact-form.css:49`, `footer.css:2` +23 | 6 |
| `color.teal.600` | `#338a99` | ✅ used | 1 | `home.css:272` | 1 |
| `color.slate.50` | `#fbfcfd` | ✅ used | 1 | `home.css:84` | 1 |
| `color.slate.100` | `#f9fafc` | ✅ used | 1 | `howitworks.css:61` | 1 |
| `color.slate.200` | `#e2e8f0` | ✅ used | 10 | `header.css:35`, `header.css:61`, `home.css:86` +7 | 1 |
| `color.slate.600` | `#46556e` | ✅ used | 18 | `header.css:4`, `home.css:61`, `home.css:78` +15 | 1 |
| `color.gray.500` | `#808080` | ✅ used | 2 | `home.css:248`, `home.css:264` | 1 |
| `color.red.100` | `#f8d7da` | ✅ used | 1 | `notification.css:18` | 1 |
| `color.red.500` | `#ff0000` | ✅ used | 1 | `notification.css:19` | 1 |
| `color.green.100` | `#daf2dc` | ✅ used | 1 | `notification.css:23` | 1 |
| `color.green.500` | `#22bb33` | ✅ used | 1 | `notification.css:24` | 1 |
| `color.black-alpha.5` | `rgba(0, 0, 0, 0.05)` | ❌ unused | 0 | — | 1 |
| `color.black-alpha.8` | `rgba(0, 0, 0, 0.08)` | ❌ unused | 0 | — | 1 |
| `color.black-alpha.12` | `rgba(0, 0, 0, 0.12)` | ❌ unused | 0 | — | 1 |
| `color.black-alpha.50` | `rgba(0, 0, 0, 0.5)` | ✅ used | 3 | `contact-form.css:35`, `signup.css:35`, `subscription.css:36` | 1 |
| `color.white-alpha.80` | `rgba(255, 255, 255, 0.8)` | ✅ used | 1 | `home.css:180` | 1 |
| `space.none` | `0rem` | ✅ used | 17 | `footer.css:60`, `header.css:12`, `header.css:79` +14 | 0 |
| `space.2xs` | `0.25rem` | ✅ used | 8 | `footer.css:109`, `home.css:252`, `home.css:148` +5 | 2 |
| `space.xs` | `0.5rem` | ✅ used | 6 | `footer.css:83`, `home.css:282`, `post.css:37` +3 | 1 |
| `space.sm` | `0.75rem` | ✅ used | 22 | `contact-form.css:7`, `contact-form.css:22`, `contact-form.css:23` +19 | 2 |
| `space.md` | `1rem` | ✅ used | 60 | `contact-form.css:7`, `contact-form.css:60`, `footer.css:11` +57 | 3 |
| `space.lg` | `1.5rem` | ✅ used | 25 | `contact-form.css:3`, `contact-form.css:22`, `footer.css:8` +22 | 2 |
| `space.xl` | `2rem` | ✅ used | 17 | `contact-form.css:31`, `contact-form.css:50`, `contact-form.css:56` +14 | 3 |
| `space.2xl` | `3rem` | ✅ used | 4 | `home.css:32`, `post.css:4`, `subscription.css:24` +1 | 0 |
| `space.3xl` | `4rem` | ✅ used | 9 | `home.css:58`, `home.css:73`, `home.css:113` +6 | 1 |
| `radius.none` | `0px` | ✅ used | 3 | `footer.css:95`, `header.css:63`, `insights.css:28` | 0 |
| `radius.sm` | `4px` | ✅ used | 1 | `home.css:249` | 0 |
| `radius.md` | `8px` | ✅ used | 14 | `contact-form.css:8`, `contact-form.css:18`, `notification.css:3` +11 | 1 |
| `radius.lg` | `12px` | ✅ used | 12 | `contact-form.css:29`, `footer.css:75`, `footer.css:87` +9 | 1 |
| `radius.xl` | `16px` | ✅ used | 5 | `legal.css:8`, `legal.css:60`, `legal.css:75` +2 | 1 |
| `radius.2xl` | `32px` | ✅ used | 1 | `home.css:181` | 1 |
| `radius.pill` | `999px` | ≈ approximated | 1 | `howitworks.css:90` | 1 |
| `border-width.thin` | `1px` | ✅ used | 16 | `header.css:35`, `header.css:61`, `header.css:113` +13 | 3 |
| `border-width.thick` | `2px` | ✅ used | 2 | `howitworks.css:35`, `howitworks.css:36` | 1 |
| `size.8` | `8px` | ✅ used | 2 | `howitworks.css:39`, `howitworks.css:42` | 1 |
| `size.20` | `1.25rem` | ✅ used | 2 | `style.css:156`, `style.css:160` | 1 |
| `size.24` | `1.5rem` | ✅ used | 1 | `home.css:210` | 1 |
| `size.40` | `40px` | ✅ used | 3 | `footer.css:90`, `footer.css:91`, `header.css:91` | 1 |
| `size.50` | `50px` | ✅ used | 2 | `home.css:102`, `home.css:106` | 1 |
| `size.64` | `4rem` | ✅ used | 1 | `howitworks.css:94` | 1 |
| `size.420` | `420px` | ✅ used | 3 | `contact-form.css:32`, `signup.css:32`, `subscription.css:33` | 1 |
| `size.464` | `464px` | ✅ used | 1 | `home.css:188` | 1 |
| `size.500` | `500px` | ✅ used | 1 | `home.css:137` | 1 |
| `size.768` | `768px` | ✅ used | 3 | `home.css:79`, `home.css:126`, `home.css:166` | 1 |
| `size.800` | `800px` | ✅ used | 1 | `howitworks.css:9` | 1 |
| `size.960` | `60rem` | ✅ used | 1 | `post.css:2` | 1 |
| `size.1200` | `1200px` | ✅ used | 1 | `home.css:72` | 1 |
| `size.1440` | `1440px` | ✅ used | 1 | `style.css:85` | 1 |
| `breakpoint.md` | `900px` | ✅ used | 3 | `footer.css:119`, `header.css:97`, `home.css:311` | 1 |
| `breakpoint.lg` | `1200px` | ✅ used | 1 | `home.css:305` | 0 |
| `font.family.sans` | `Cabin` | ✅ used | 1 | `style.css:75` | 13 |
| `font.weight.regular` | `400` | ✅ used | 2 | `home.css:294`, `style.css:119` | 5 |
| `font.weight.medium` | `500` | ✅ used | 4 | `home.css:63`, `home.css:95`, `home.css:117` +1 | 1 |
| `font.weight.semibold` | `600` | ✅ used | 5 | `howitworks.css:24`, `insights.css:22`, `legal.css:15` +2 | 3 |
| `font.weight.bold` | `700` | ✅ used | 2 | `footer.css:34`, `legal.css:68` | 4 |
| `font.size.xs` | `0.75rem` | ✅ used | 2 | `home.css:266`, `home.css:275` | 1 |
| `font.size.sm` | `0.875rem` | ❌ unused | 0 | — | 1 |
| `font.size.md` | `1rem` | ✅ used | 6 | `footer.css:33`, `footer.css:69`, `footer.css:122` +3 | 3 |
| `font.size.lg` | `1.125rem` | ❌ unused | 0 | — | 0 |
| `font.size.xl` | `1.25rem` | ✅ used | 4 | `legal.css:67`, `post.css:19`, `style.css:145` +1 | 2 |
| `font.size.2xl` | `1.5rem` | ✅ used | 8 | `contact-form.css:42`, `home.css:36`, `legal.css:43` +5 | 3 |
| `font.size.3xl` | `2rem` | ✅ used | 3 | `home.css:62`, `legal.css:37`, `home.css:8` | 2 |
| `font.size.4xl` | `2.5rem` | ✅ used | 1 | `post.css:9` | 1 |
| `font.size.5xl` | `3rem` | ❌ unused | 0 | — | 0 |
| `font.line-height.tight` | `1.1` | ✅ used | 1 | `reset.css:52` | 6 |
| `font.line-height.normal` | `1.5` | ✅ used | 1 | `reset.css:35` | 7 |
| `duration.none` | `0ms` | ❌ unused | 0 | — | 1 |
| `duration.fast` | `200ms` | ✅ used | 1 | `howitworks.css:41` | 1 |
| `easing.ease` | `cubic-bezier(0.25,0.1,0.25,1)` | ✅ used | 1 | `howitworks.css:41` | 1 |
| `shadow.sm` | `0px 1px 2px 0px rgba(0, 0, 0, 0.05)` | ❌ unused | 0 | — | 1 |
| `shadow.md` | `0px 4px 6px 0px rgba(0, 0, 0, 0.08)` | ❌ unused | 0 | — | 1 |
| `shadow.lg` | `0px 10px 20px 0px rgba(0, 0, 0, 0.12)` | ❌ unused | 0 | — | 1 |
| `z-index.below` | `-1` | ✅ used | 1 | `insights.css:33` | 1 |
| `z-index.base` | `0` | ❌ unused | 0 | — | 0 |
| `z-index.raised` | `1` | ✅ used | 1 | `header.css:13` | 1 |

</details>

## Stage 2 — Semantic tokens

4 of 79 semantic tokens have no use in the CSS, and 1 is only an implicit browser default.

### Unused

| Token | Value | Aliased by | Notes |
| --- | --- | --- | --- |
| `color.text.default` | `#000000` | `input.foreground` | Implicit only. Black is the browser default; no rule sets it. |
| `typography.body.sm` | `composite` | `footer.typography` | Its only consumer, `footer.typography`, doesn't match the CSS (`0.9rem`, not `0.875rem`). |
| `elevation.low` | `0px 1px 2px 0px rgba(0, 0, 0, 0.05)` | — | No `box-shadow` anywhere; no component uses it. |
| `elevation.medium` | `0px 4px 6px 0px rgba(0, 0, 0, 0.08)` | — | No `box-shadow` anywhere; no component uses it. |
| `elevation.high` | `0px 10px 20px 0px rgba(0, 0, 0, 0.12)` | — | No `box-shadow` anywhere; no component uses it. |

### Used, but no component token refers to them

| Token | Where | Notes |
| --- | --- | --- |
| `color.action.secondary.border` | `home.css:144`, `home.css:193`, `post.css:36` | Used in CSS, but `button.secondary.border` aliases `border.strong` instead. |
| `size.icon.sm` | `style.css:156`, `style.css:160` | Card arrow icons (`style.css:156`); no component token covers them. |
| `size.measure.page` | `style.css:85` | `.container` width (`style.css:85`); no component token covers it. |
| `typography.heading.lg` | `legal.css:37`, `home.css:8` | Used by legal `h1` and home `h2`; `prose.h1` points at `heading.xl`. |
| `typography.title.lg` | `legal.css:14` | Legal `.contact` header; `callout.title` points at `title.md`. |
| `layer.behind` | `insights.css:33` | Insight card image (`insights.css:33`); no component token covers it. |

<details>
<summary>All 79 semantic tokens</summary>

| Token | Status | Where | Aliased by | Notes |
| --- | --- | --- | ---: | --- |
| `color.background.page` | ✅ used | `header.css:3`, `header.css:60`, `home.css:205` | 4 |  |
| `color.background.subtle` | ✅ used | `contact-form.css:28`, `home.css:112`, `legal.css:7` | 3 |  |
| `color.background.muted` | ✅ used | `howitworks.css:61` | 1 |  |
| `color.background.raised` | ✅ used | `home.css:84` | 1 |  |
| `color.background.accent` | ✅ used | `footer.css:86`, `howitworks.css:89` | 2 |  |
| `color.background.inverse` | ✅ used | `contact-form.css:17`, `footer.css:2`, `header.css:53` | 4 |  |
| `color.background.glass` | ✅ used | `home.css:180` | 1 |  |
| `color.background.overlay` | ✅ used | `contact-form.css:35`, `signup.css:35`, `subscription.css:36` | 1 |  |
| `color.text.default` | ◐ implicit | — | 1 | Black is the browser default; no rule sets it. |
| `color.text.subtle` | ✅ used | `header.css:4`, `home.css:61`, `home.css:78` | 9 |  |
| `color.text.brand` | ✅ used | `legal.css:36`, `post.css:8`, `home.css:94` | 6 |  |
| `color.text.inverse` | ✅ used | `contact-form.css:20`, `footer.css:3`, `header.css:54` | 3 |  |
| `color.border.default` | ✅ used | `header.css:35`, `header.css:61`, `home.css:86` | 1 |  |
| `color.border.strong` | ✅ used | `header.css:113`, `home.css:144`, `home.css:193` | 1 |  |
| `color.border.neutral` | ✅ used | `home.css:248`, `home.css:264` | 1 |  |
| `color.action.primary.background` | ✅ used | `contact-form.css:17`, `header.css:53`, `home.css:156` | 2 |  |
| `color.action.primary.foreground` | ✅ used | `contact-form.css:20`, `header.css:54`, `home.css:158` | 2 |  |
| `color.action.secondary.background` | ✅ used | `home.css:205`, `header.css:33` | 1 |  |
| `color.action.secondary.foreground` | ✅ used | `home.css:206` | 1 |  |
| `color.action.secondary.border` | ✅ used | `home.css:144`, `home.css:193`, `post.css:36` | 0 | Used in CSS, but `button.secondary.border` aliases `border.strong` instead. |
| `color.feedback.danger.background` | ✅ used | `notification.css:18` | 1 |  |
| `color.feedback.danger.foreground` | ✅ used | `notification.css:19` | 1 |  |
| `color.feedback.success.background` | ✅ used | `notification.css:23` | 1 |  |
| `color.feedback.success.foreground` | ✅ used | `notification.css:24` | 1 |  |
| `color.feedback.info.background` | ✅ used | `home.css:272` | 1 |  |
| `color.feedback.info.foreground` | ✅ used | `home.css:274` | 1 |  |
| `space.gap.tight` | ✅ used | `footer.css:109`, `home.css:148`, `home.css:196` | 1 |  |
| `space.gap.compact` | ✅ used | `footer.css:43`, `notification.css:5` | 2 |  |
| `space.gap.default` | ✅ used | `footer.css:115`, `header.css:17`, `header.css:26` | 6 |  |
| `space.gap.loose` | ✅ used | `contact-form.css:3`, `footer.css:8`, `footer.css:123` | 3 |  |
| `space.gap.wide` | ✅ used | `home.css:69` | 1 |  |
| `space.inset.2xs` | ✅ used | `home.css:267`, `home.css:276` | 1 |  |
| `space.inset.xs` | ✅ used | `home.css:267`, `home.css:276`, `post.css:37` | 2 |  |
| `space.inset.sm` | ✅ used | `contact-form.css:7`, `contact-form.css:22`, `header.css:37` | 6 |  |
| `space.inset.md` | ✅ used | `contact-form.css:7`, `footer.css:11`, `footer.css:111` | 7 |  |
| `space.inset.lg` | ✅ used | `contact-form.css:22`, `header.css:70`, `home.css:151` | 8 |  |
| `space.inset.xl` | ✅ used | `contact-form.css:31`, `contact-form.css:50`, `footer.css:10` | 3 |  |
| `space.section` | ✅ used | `home.css:58`, `insights.css:6`, `style.css:129` | 1 |  |
| `space.gutter.page` | ✅ used | `header.css:10`, `footer.css:11`, `home.css:255` | 2 |  |
| `space.gutter.container` | ✅ used | `style.css:86` | 1 |  |
| `radius.control` | ✅ used | `contact-form.css:8`, `contact-form.css:18`, `home.css:143` | 5 |  |
| `radius.card` | ✅ used | `contact-form.css:29`, `home.css:85`, `header.css:34` | 8 |  |
| `radius.panel` | ✅ used | `legal.css:8`, `legal.css:60`, `style.css:138` | 1 |  |
| `radius.feature` | ✅ used | `home.css:181` | 1 |  |
| `radius.circle` | ✅ used | `howitworks.css:90` | 1 | Approximated: CSS uses `50%`. |
| `size.icon.sm` | ✅ used | `style.css:156`, `style.css:160` | 0 | Card arrow icons (`style.css:156`); no component token covers them. |
| `size.icon.md` | ✅ used | `home.css:210` | 1 |  |
| `size.control.md` | ✅ used | `footer.css:90` | 2 |  |
| `size.control.lg` | ✅ used | `home.css:102`, `home.css:106` | 1 |  |
| `size.control.xl` | ✅ used | `howitworks.css:94` | 1 |  |
| `size.measure.dialog` | ✅ used | `contact-form.css:32`, `signup.css:32`, `subscription.css:33` | 1 |  |
| `size.measure.narrow` | ✅ used | `home.css:137` | 1 |  |
| `size.measure.text` | ✅ used | `home.css:79`, `home.css:126`, `home.css:166` | 1 |  |
| `size.measure.prose` | ✅ used | `post.css:2` | 1 |  |
| `size.measure.wide` | ✅ used | `home.css:72` | 1 |  |
| `size.measure.page` | ✅ used | `style.css:85` | 0 | `.container` width (`style.css:85`); no component token covers it. |
| `typography.heading.xl` | ✅ used | `post.css:9` | 1 |  |
| `typography.heading.lg` | ✅ used | `legal.css:37`, `home.css:8` | 0 | Used by legal `h1` and home `h2`; `prose.h1` points at `heading.xl`. |
| `typography.heading.md` | ✅ used | `legal.css:43`, `post.css:14`, `home.css:36` | 1 |  |
| `typography.heading.sm` | ✅ used | `post.css:19`, `legal.css:67` | 1 |  |
| `typography.display` | ✅ used | `home.css:62`, `home.css:117` | 1 |  |
| `typography.title.lg` | ✅ used | `legal.css:14` | 0 | Legal `.contact` header; `callout.title` points at `title.md`. |
| `typography.title.md` | ✅ used | `style.css:145` | 2 |  |
| `typography.body.lg` | ✅ used | `home.css:184` | 1 |  |
| `typography.body.md` | ✅ used | `reset.css:35`, `home.css:89`, `header.css:45` | 2 |  |
| `typography.body.sm` | ❌ unused | — | 1 | Its only consumer, `footer.typography`, doesn't match the CSS (`0.9rem`, not `0.875rem`). |
| `typography.emphasis` | ✅ used | `style.css:104`, `howitworks.css:24` | 1 | Matched on weight (`em`, `summary`); size is inherited. |
| `typography.label` | ✅ used | `reset.css:52`, `reset.css:84` | 2 | Controls inherit the font and get `line-height: 1.1` from `reset.css`. |
| `typography.caption` | ✅ used | `home.css:266`, `home.css:275` | 1 |  |
| `border.default` | ✅ used | `header.css:35`, `header.css:61`, `home.css:86` | 7 |  |
| `border.strong` | ✅ used | `header.css:113`, `home.css:144`, `home.css:193` | 3 |  |
| `border.neutral` | ✅ used | `home.css:248`, `home.css:264` | 1 |  |
| `border.marker` | ✅ used | `howitworks.css:35`, `howitworks.css:36` | 1 |  |
| `elevation.low` | ❌ unused | — | 0 | No `box-shadow` anywhere; no component uses it. |
| `elevation.medium` | ❌ unused | — | 0 | No `box-shadow` anywhere; no component uses it. |
| `elevation.high` | ❌ unused | — | 0 | No `box-shadow` anywhere; no component uses it. |
| `transition.default` | ✅ used | `howitworks.css:41` | 1 |  |
| `layer.behind` | ✅ used | `insights.css:33` | 0 | Insight card image (`insights.css:33`); no component token covers it. |
| `layer.sticky` | ✅ used | `header.css:13` | 1 |  |

</details>

## Stage 3 — Component tokens

4 of 149 component tokens have no use in the CSS. Another 12 are used by some of the component's selectors, while others set a different value.

### Unused

| Token | Status | Notes |
| --- | --- | --- |
| `footer.typography` | ❌ value never used | Token is `0.875rem`; the footer uses `0.9rem` (`footer.css:7`) and `1rem` from 900px (`footer.css:122`). |
| `input.background` | ❌ unused | No input sets a background; inputs show the browser default white. |
| `input.foreground` | ❌ unused | No input sets a text color; inputs use the browser default. |
| `prose.h3.color` | ❌ unused | Post `h3` has no color, so it renders black, not brand navy. |

### Partly used (drift)

Not dead, but the CSS disagrees with itself. Generating the CSS from these tokens would change how these elements look.

| Token | Notes |
| --- | --- |
| `button.size.md.padding-inline` | Form submits match; `.subscription` buttons use `space.2xl` (`subscription.css:24`, `:72`). |
| `button.link.foreground` | Legal `.contact-us` matches; footer `.contact-us` reads `var(--text-white)`, which is **undefined** (`footer.css:58`). |
| `callout.title.typography` | `.notice` header is `bold`, not semibold (`legal.css:68`); `.contact` header is `1.5rem` = `title.lg` (`legal.css:14`). |
| `card.radius` | `.benefit` matches; `article`/`.card` use `1rem` = `radius.panel` (`style.css:138`). |
| `card.padding` | `article` inline matches; `.benefit` uses `space.inset.xl` (`home.css:91`), `article` block is fluid (`style.css:141`). |
| `card.title.typography` | `article header` matches; `.benefit h3` is weight 500 (`home.css:95`). |
| `footer.legal.gap` | Legal nav list matches; the `footer.legal` container uses `space.2xs` (`footer.css:109`). |
| `icon-tile.padding` | `.benefit .icon` matches; `.more .icon` uses `space.md` (`howitworks.css:92`). |
| `input.border` | Subscription input matches; contact and sign-up inputs have `border: none` (`contact-form.css:9`, `signup.css:9`). |
| `modal.gap` | Contact and sign-up forms match; subscription form uses `space.md` (`subscription.css:57`). |
| `prose.h1.typography` | Post `h1` matches; legal `h1` is `3xl` = `heading.lg` (`legal.css:37`). |
| `section.padding-inline` | `.cta` matches; `.benefits` uses `0` (`home.css:58`), `.subscription` uses `space.md` (`subscription.css:6`). |

### By component

| Component | Tokens | Used | Partly used | Unused |
| --- | ---: | ---: | ---: | ---: |
| `accordion` | 13 | 13 | 0 | 0 |
| `badge` | 7 | 7 | 0 | 0 |
| `button` | 14 | 12 | 2 | 0 |
| `callout` | 9 | 8 | 1 | 0 |
| `card` | 9 | 6 | 3 | 0 |
| `footer` | 12 | 10 | 1 | 1 |
| `header` | 21 | 21 | 0 | 0 |
| `hero` | 6 | 6 | 0 | 0 |
| `icon-tile` | 8 | 7 | 1 | 0 |
| `input` | 7 | 4 | 1 | 2 |
| `modal` | 8 | 7 | 1 | 0 |
| `notification` | 7 | 7 | 0 | 0 |
| `prose` | 14 | 12 | 1 | 1 |
| `section` | 14 | 13 | 1 | 0 |

<details>
<summary>All 149 component tokens</summary>

| Token | Status | Where |
| --- | --- | --- |
| `accordion.border` | ✅ used | `howitworks.css:6` |
| `accordion.radius` | ✅ used | `howitworks.css:7` |
| `accordion.max-width` | ✅ used | `howitworks.css:9` |
| `accordion.item.divider` | ✅ used | `howitworks.css:13` |
| `accordion.item.padding-block` | ✅ used | `howitworks.css:14` |
| `accordion.item.padding-inline` | ✅ used | `howitworks.css:14` |
| `accordion.summary.typography` | ✅ used | `howitworks.css:24` |
| `accordion.summary.padding-block` | ✅ used | `howitworks.css:28` |
| `accordion.summary.gap` | ✅ used | `howitworks.css:25` |
| `accordion.marker.border` | ✅ used | `howitworks.css:35`, `howitworks.css:36` |
| `accordion.marker.size` | ✅ used | `howitworks.css:39`, `howitworks.css:42` |
| `accordion.marker.transition` | ✅ used | `howitworks.css:41` |
| `accordion.content.color` | ✅ used | `howitworks.css:52` |
| `badge.radius` | ✅ used | `home.css:265`, `home.css:273` |
| `badge.padding-block` | ✅ used | `home.css:267`, `home.css:276` |
| `badge.padding-inline` | ✅ used | `home.css:267`, `home.css:276` |
| `badge.typography` | ✅ used | `home.css:266`, `home.css:275` |
| `badge.outline.border` | ✅ used | `home.css:264` |
| `badge.info.background` | ✅ used | `home.css:272` |
| `badge.info.foreground` | ✅ used | `home.css:274` |
| `button.radius` | ✅ used | `contact-form.css:18`, `home.css:143`, `home.css:192` |
| `button.gap` | ✅ used | `home.css:148`, `home.css:196`, `home.css:226` |
| `button.typography` | ✅ used | `reset.css:52`, `reset.css:84` |
| `button.icon-size` | ✅ used (responsive variant) | `home.css:210`, `home.css:211` |
| `button.size.md.padding-block` | ✅ used | `contact-form.css:22`, `signup.css:22`, `subscription.css:24` |
| `button.size.md.padding-inline` | ⚠️ partly used | `contact-form.css:22`, `signup.css:22`, `subscription.css:24` |
| `button.size.lg.padding-block` | ✅ used | `home.css:150`, `home.css:198`, `home.css:228` |
| `button.size.lg.padding-inline` | ✅ used | `home.css:151`, `home.css:199`, `home.css:229` |
| `button.primary.background` | ✅ used | `contact-form.css:17`, `home.css:156`, `home.css:220` |
| `button.primary.foreground` | ✅ used | `contact-form.css:20`, `home.css:158`, `home.css:223` |
| `button.secondary.background` | ✅ used | `home.css:205` |
| `button.secondary.foreground` | ✅ used | `home.css:206` |
| `button.secondary.border` | ✅ used | `home.css:144`, `home.css:193` |
| `button.link.foreground` | ⚠️ partly used | `footer.css:58`, `legal.css:22` |
| `callout.background` | ✅ used | `legal.css:7`, `legal.css:59` |
| `callout.foreground` | ✅ used | `legal.css:6`, `legal.css:58` |
| `callout.border` | ✅ used | `legal.css:9`, `legal.css:61` |
| `callout.radius` | ✅ used | `legal.css:8`, `legal.css:60`, `legal.css:75` |
| `callout.padding` | ✅ used | `legal.css:11`, `legal.css:63`, `legal.css:78` |
| `callout.title.typography` | ⚠️ partly used | `legal.css:14`, `legal.css:15`, `legal.css:67` |
| `callout.title.color` | ✅ used | `legal.css:66` |
| `callout.inverse.background` | ✅ used | `legal.css:74` |
| `callout.inverse.foreground` | ✅ used | `legal.css:81`, `legal.css:85` |
| `card.background` | ✅ used | `home.css:84` |
| `card.border` | ✅ used | `home.css:86`, `style.css:137` |
| `card.radius` | ⚠️ partly used | `home.css:85`, `style.css:138` |
| `card.padding` | ⚠️ partly used | `home.css:91`, `style.css:141`, `style.css:142` |
| `card.gap` | ✅ used | `home.css:90`, `insights.css:11`, `style.css:140` |
| `card.title.typography` | ⚠️ partly used | `home.css:95`, `insights.css:22`, `style.css:145` |
| `card.title.color` | ✅ used | `home.css:94` |
| `card.body.typography` | ✅ used | `home.css:89` |
| `card.body.color` | ✅ used | `home.css:78` |
| `footer.background` | ✅ used | `footer.css:2` |
| `footer.foreground` | ✅ used | `footer.css:3` |
| `footer.typography` | ❌ value never used | `footer.css:7`, `footer.css:122` |
| `footer.padding-block` | ✅ used | `footer.css:10` |
| `footer.padding-inline` | ✅ used | `footer.css:11` |
| `footer.gap` | ✅ used | `footer.css:8`, `footer.css:123` |
| `footer.nav.gap` | ✅ used | `footer.css:43` |
| `footer.social.background` | ✅ used | `footer.css:86` |
| `footer.social.radius` | ✅ used | `footer.css:87` |
| `footer.social.size` | ✅ used | `footer.css:90`, `footer.css:91` |
| `footer.legal.padding-block` | ✅ used | `footer.css:111` |
| `footer.legal.gap` | ⚠️ partly used | `footer.css:109`, `footer.css:115` |
| `header.background` | ✅ used | `header.css:3` |
| `header.foreground` | ✅ used | `header.css:4` |
| `header.padding-block` | ✅ used | `header.css:9` |
| `header.padding-inline` | ✅ used | `header.css:10` |
| `header.layer` | ✅ used | `header.css:13` |
| `header.breakpoint` | ✅ used | — |
| `header.nav.gap` | ✅ used (responsive variant) | `header.css:26`, `header.css:100` |
| `header.nav.item.border` | ✅ used (responsive variant) | `header.css:78`, `header.css:113` |
| `header.nav.item.radius` | ✅ used | `header.css:43`, `header.css:114` |
| `header.nav.item.padding-inline` | ✅ used (responsive variant) | `header.css:47`, `header.css:79`, `header.css:115` |
| `header.nav.login.background` | ✅ used | `header.css:53` |
| `header.nav.login.foreground` | ✅ used | `header.css:54` |
| `header.nav.toggle.background` | ✅ used | `header.css:33` |
| `header.nav.toggle.border` | ✅ used | `header.css:35` |
| `header.nav.toggle.radius` | ✅ used | `header.css:34` |
| `header.nav.toggle.padding` | ✅ used | `header.css:37` |
| `header.nav.menu.background` | ✅ used | `header.css:60` |
| `header.nav.menu.border` | ✅ used (responsive variant) | `header.css:61`, `header.css:104` |
| `header.nav.menu.radius` | ✅ used | `header.css:63` |
| `header.nav.menu.padding-block` | ✅ used (responsive variant) | `header.css:69`, `header.css:109` |
| `header.nav.menu.padding-inline` | ✅ used | `header.css:70` |
| `hero.panel.background` | ✅ used | `home.css:180` |
| `hero.panel.radius` | ✅ used | `home.css:181` |
| `hero.panel.padding` | ✅ used | `home.css:187` |
| `hero.panel.gap` | ✅ used | `home.css:185` |
| `hero.panel.width` | ✅ used | `home.css:188` |
| `hero.panel.typography` | ✅ used | `home.css:184` |
| `icon-tile.radius` | ✅ used (responsive variant) | `footer.css:87`, `home.css:100`, `howitworks.css:90` |
| `icon-tile.padding` | ⚠️ partly used | `home.css:104`, `howitworks.css:92` |
| `icon-tile.size.md` | ✅ used | `footer.css:90`, `footer.css:91` |
| `icon-tile.size.lg` | ✅ used | `home.css:102`, `home.css:106` |
| `icon-tile.size.xl` | ✅ used | `howitworks.css:94` |
| `icon-tile.brand.background` | ✅ used | `home.css:99` |
| `icon-tile.accent.background` | ✅ used | `footer.css:86`, `howitworks.css:89` |
| `icon-tile.round.radius` | ✅ used | `howitworks.css:90` |
| `input.background` | ❌ unused | — |
| `input.foreground` | ❌ unused | — |
| `input.border` | ⚠️ partly used | `contact-form.css:9`, `signup.css:9`, `subscription.css:61` |
| `input.radius` | ✅ used | `contact-form.css:8`, `signup.css:8`, `subscription.css:60` |
| `input.padding-block` | ✅ used | `contact-form.css:7`, `signup.css:7`, `subscription.css:62` |
| `input.padding-inline` | ✅ used | `contact-form.css:7`, `signup.css:7`, `subscription.css:62` |
| `input.typography` | ✅ used | `reset.css:52`, `reset.css:84` |
| `modal.background` | ✅ used | `contact-form.css:28`, `signup.css:28`, `subscription.css:29` |
| `modal.overlay` | ✅ used | `contact-form.css:35`, `signup.css:35`, `subscription.css:36` |
| `modal.radius` | ✅ used | `contact-form.css:29`, `signup.css:29`, `subscription.css:30` |
| `modal.padding` | ✅ used | `contact-form.css:31`, `signup.css:31`, `subscription.css:32` |
| `modal.width` | ✅ used | `contact-form.css:32`, `signup.css:32`, `subscription.css:33` |
| `modal.gap` | ⚠️ partly used | `contact-form.css:3`, `signup.css:3`, `subscription.css:57` |
| `modal.title.color` | ✅ used | `contact-form.css:49`, `signup.css:49`, `subscription.css:50` |
| `modal.title.padding` | ✅ used | `contact-form.css:50`, `signup.css:50`, `subscription.css:51` |
| `notification.radius` | ✅ used | `notification.css:3` |
| `notification.padding` | ✅ used | `notification.css:7` |
| `notification.gap` | ✅ used | `notification.css:5` |
| `notification.danger.background` | ✅ used | `notification.css:18` |
| `notification.danger.foreground` | ✅ used | `notification.css:19` |
| `notification.success.background` | ✅ used | `notification.css:23` |
| `notification.success.foreground` | ✅ used | `notification.css:24` |
| `prose.max-width` | ✅ used | `post.css:2` |
| `prose.spacing` | ✅ used | `legal.css:44`, `legal.css:54`, `post.css:15` |
| `prose.h1.typography` | ⚠️ partly used | `legal.css:37`, `post.css:9` |
| `prose.h1.color` | ✅ used | `legal.css:36`, `post.css:8` |
| `prose.h2.typography` | ✅ used | `legal.css:43`, `post.css:14` |
| `prose.h2.color` | ✅ used | `legal.css:42` |
| `prose.h3.typography` | ✅ used | `post.css:19` |
| `prose.h3.color` | ❌ unused | — |
| `prose.body.typography` | ✅ used | `post.css:24` |
| `prose.body.color` | ✅ used | `legal.css:53` |
| `prose.nav-link.border` | ✅ used | `post.css:36` |
| `prose.nav-link.radius` | ✅ used | `post.css:35` |
| `prose.nav-link.padding-block` | ✅ used | `post.css:37` |
| `prose.nav-link.padding-inline` | ✅ used | `post.css:38` |
| `section.padding-block` | ✅ used | `home.css:58`, `home.css:113`, `home.css:244` |
| `section.padding-inline` | ⚠️ partly used | `home.css:58`, `home.css:113`, `subscription.css:6` |
| `section.gap` | ✅ used | `home.css:69` |
| `section.max-width` | ✅ used | `home.css:72` |
| `section.title.typography` | ✅ used | `home.css:8`, `home.css:62`, `home.css:63` |
| `section.title.color` | ✅ used | `home.css:61`, `home.css:116` |
| `section.body.color` | ✅ used | `home.css:78`, `home.css:122`, `home.css:164` |
| `section.body.max-width` | ✅ used | `home.css:79`, `home.css:126`, `home.css:166` |
| `section.actions.max-width` | ✅ used | `home.css:137` |
| `section.actions.gap` | ✅ used | `home.css:133` |
| `section.tinted.background` | ✅ used | `home.css:112`, `subscription.css:3` |
| `section.muted.background` | ✅ used | `howitworks.css:61` |
| `section.banner.background` | ✅ used | `style.css:126` |
| `section.banner.foreground` | ✅ used | `style.css:127` |

</details>

## Recommendations

1. **Delete the shadow chain** (9 tokens): `color.black-alpha.{5,8,12}`, `shadow.{sm,md,lg}`, `elevation.{low,medium,high}`. Also delete the matching `--shadow-*` custom properties in `style.css`. If shadows are planned, keep `elevation.*` and give them a component consumer.
2. **Delete unreferenced, unused primitives**: `font.size.lg`, `font.size.5xl`, `z-index.base`.
3. **Settle the small footer text size:** either set the footer to `0.875rem` or change `font.size.sm` to `0.9rem`. Today `font.size.sm` → `typography.body.sm` → `footer.typography` is used by nothing.
4. **Decide on the three unset component tokens:** set `input.background`/`input.foreground` in CSS, or drop them; give post `h3` the brand color, or drop `prose.h3.color`.
5. **Add roles for values the CSS uses without a semantic token:** `space.2xl` (4 uses), the `4px` radius on investment cards, `breakpoint.lg`. The investment card itself has no component tokens.
6. **Resolve the 12 drift cases** before generating CSS from tokens, by picking one value per component (see Stage 3).
7. **Keep** `duration.none` (the format requires a `delay` on transitions) and `color.text.default` (it documents the browser default the site relies on).

### Also found in the CSS

- `footer.css:58` reads `var(--text-white)`, which is never defined. The footer link is white only because it inherits the footer's color.
- Custom properties declared in `style.css` `:root` but never read: `--color-black`, `--radius-sm`, `--radius-pill`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--text-xs`, `--text-sm`, `--text-md`, `--text-lg`, `--text-5xl`.
