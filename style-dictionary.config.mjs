import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import StyleDictionary from "style-dictionary";

/**
 * The resolver document is the single source of truth for which token files
 * exist and in which tier (primitive/semantic/component) they belong - other
 * resolver-aware tools read it directly. Deriving the build's `source` glob
 * from it instead of hand-duplicating the file list means the two can't drift
 * apart.
 */
const resolverPath = fileURLToPath(
  new URL("./tokens/zuba.resolver.json", import.meta.url),
);
const resolver = JSON.parse(readFileSync(resolverPath, "utf-8"));

const source = resolver.resolutionOrder
  .map((ref) => ref.$ref.replace("#/sets/", ""))
  .flatMap((setName) => resolver.sets[setName].sources)
  .map((source) => `tokens/${source.$ref}`);

/** @param {{value:number,unit:string}} dim */
function dimensionToCss(dim) {
  return `${dim.value}${dim.unit}`;
}

/**
 * Colors are authored as DTCG structured objects with a hex fallback, but per
 * tokens/README.md "components is the source of truth" - the hex field is
 * documentation for non-token tooling, not what CSS should emit.
 *
 * @param {{colorSpace:string,components:number[],alpha?:number}} color
 */
function colorToCss(color) {
  const { colorSpace, components, alpha } = color;
  const hasAlpha = alpha !== undefined && alpha !== 1;

  if (colorSpace === "srgb") {
    const [r, g, b] = components.map((c) => Math.round(c * 255));
    return hasAlpha ? `rgb(${r} ${g} ${b} / ${alpha})` : `rgb(${r} ${g} ${b})`;
  }

  const comps = components.join(" ");
  return hasAlpha
    ? `${colorSpace}(${comps} / ${alpha})`
    : `${colorSpace}(${comps})`;
}

StyleDictionary.registerTransform({
  name: "zuba/color/css",
  type: "value",
  // color can be a reference embedded in a composite (shadow, border); re-run
  // even when the token's own $value is itself a plain reference.
  transitive: true,
  filter: (token, options) =>
    (options.usesDtcg ? token.$type : token.type) === "color",
  transform: (token, _config, options) => {
    const val = options.usesDtcg ? token.$value : token.value;
    return typeof val === "string" ? val : colorToCss(val);
  },
});

StyleDictionary.registerTransform({
  name: "zuba/dimension/css",
  type: "value",
  // must re-run even on a pure reference value, otherwise the $extensions
  // escape below (space.gutter.page's fluid calc()) is never applied -
  // Style Dictionary shortcuts straight to `var(--target)` for plain
  // single-reference dimension tokens unless the transform is transitive.
  transitive: true,
  // "duration" is the same {value, unit} shape as "dimension" (e.g. 200ms) -
  // handled by the same transform rather than a near-duplicate one.
  filter: (token, options) =>
    ["dimension", "duration"].includes(
      options.usesDtcg ? token.$type : token.type,
    ),
  // space.gutter.page is the one token the format can't express natively
  // (a fluid calc()) - $extensions["com.zubacapital.css"] carries the real
  // CSS value for it, with $value left as the closest static approximation.
  transform: (token, _config, options) => {
    const cssEscape = token.$extensions?.["com.zubacapital.css"]?.value;
    if (cssEscape) return cssEscape;
    const val = options.usesDtcg ? token.$value : token.value;
    return typeof val === "string" ? val : dimensionToCss(val);
  },
});

StyleDictionary.registerTransformGroup({
  name: "zuba/css",
  transforms: [
    "attribute/cti",
    "name/kebab",
    "time/seconds",
    "html/icon",
    "zuba/dimension/css",
    "zuba/color/css",
    "asset/url",
    "fontFamily/css",
    "cubicBezier/css",
    "strokeStyle/css/shorthand",
    "border/css/shorthand",
    "typography/css/shorthand",
    "transition/css/shorthand",
    "shadow/css/shorthand",
  ],
});

export default {
  source,
  platforms: {
    css: {
      transformGroup: "zuba/css",
      buildPath: "dist/css/",
      options: {
        outputReferences: true,
      },
      files: [
        {
          destination: "tokens.css",
          format: "css/variables",
          options: {
            outputReferences: true,
          },
        },
      ],
    },
  },
};
